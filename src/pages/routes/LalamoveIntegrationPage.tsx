import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Bike, Car, Truck, Home, MapPin, RotateCcw, CheckCircle, ExternalLink, AlertTriangle, Phone } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const VEHICLE_OPTIONS = [
  { id: 'LALAGO', name: 'Moto', icon: Bike, description: 'Até 20kg' },
  { id: 'CAR', name: 'Carro', icon: Car, description: 'Até 200kg' },
  { id: 'VAN', name: 'Van', icon: Truck, description: 'Até 500kg' },
];

// ─── Utilitário: normaliza telefone BR para formato internacional E.164 ───────
// Entrada: "(31)99183-3103" | "31991833103" | "+5531991833103"
// Saída:   "+5531991833103"
const normalizeBrPhone = (raw: string | null | undefined): string => {
  if (!raw) return "";
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, "");
  // Já tem DDI 55?
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  // Tem DDD (10 ou 11 dígitos)?
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  // Caso inválido (ex: só DDD, ou lixo) — retorna vazio para acionar o fallback
  return "";
};

// ─── Formata stop para a Lalamove ─────────────────────────────────────────────
const formatStop = (lat: number, lng: number, address: string) => ({
  coordinates: {
    lat: lat.toFixed(7),
    lng: lng.toFixed(7),
  },
  address,
});

const LalamoveIntegrationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmHireOpen, setIsConfirmHireOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('LALAGO');
  const [quotation, setQuotation] = useState<any>(null);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const [invalidPhones, setInvalidPhones] = useState<{ id: string; name: string; phone: string; serviceId: string }[]>([]);
  const [editingPhones, setEditingPhones] = useState<Record<string, string>>({});
  const [savingPhones, setSavingPhones] = useState(false);
  const [ignoreInvalidPhones, setIgnoreInvalidPhones] = useState(false);

  // Busca a rota com suas paradas
  const { data: route, isLoading: loadingRoute } = useQuery({
    queryKey: ["route", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("*, route_stops(*, service:services(*))")
        .eq("id", id!)
        .order("sequence_number", { referencedTable: "route_stops", ascending: true })
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Busca o serviço de Início quando o tipo for "service"
  const { data: startServiceData } = useQuery({
    queryKey: ["service", route?.start_location_reference],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("id", route!.start_location_reference!)
        .maybeSingle();
      return data;
    },
    enabled: !!route && route.start_location_type === "service" && !!route.start_location_reference,
  });

  // Busca o serviço de Fim quando o tipo for "service"
  const { data: endServiceData } = useQuery({
    queryKey: ["service", route?.end_location_reference],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("id", route!.end_location_reference!)
        .maybeSingle();
      return data;
    },
    enabled: !!route && route.end_location_type === "service" && !!route.end_location_reference,
  });

  // Busca as configurações da base operacional
  const { data: settings } = useQuery({
    queryKey: ["system_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Resolve o ponto de partida ou retorno baseado no tipo configurado na rota
  const resolveLocationPoint = async (
    locationType: string,
    locationReference: string
  ): Promise<{ lat: number; lng: number; address: string } | null> => {
    if (locationType === "operational_base") {
      if (
        settings?.operational_base_latitude &&
        settings?.operational_base_longitude &&
        settings?.operational_base_address
      ) {
        return {
          lat: settings.operational_base_latitude,
          lng: settings.operational_base_longitude,
          address: settings.operational_base_address,
        };
      }
      return null;
    }

    if (locationType === "service") {
      const { data: svc } = await supabase
        .from("services")
        .select("latitude, longitude, address")
        .eq("id", locationReference)
        .single();

      if (svc?.latitude && svc?.longitude) {
        return { lat: svc.latitude, lng: svc.longitude, address: svc.address };
      }
    }

    return null;
  };

  // ─── COTAÇÃO ─────────────────────────────────────────────────────────────────
  const getQuotation = async () => {
    if (!route || !route.route_stops || !settings) return;
    setLoadingQuotation(true);

    try {
      const startPoint = await resolveLocationPoint(
        route.start_location_type,
        route.start_location_reference
      );

      const endPoint = await resolveLocationPoint(
        route.end_location_type,
        route.end_location_reference
      );

      const validMiddleStops = route.route_stops.filter((stop: any) => {
        const lat = parseFloat(stop.service?.latitude);
        const lng = parseFloat(stop.service?.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      });

      const allStops: ReturnType<typeof formatStop>[] = [];

      if (startPoint) {
        allStops.push(formatStop(startPoint.lat, startPoint.lng, startPoint.address));
      }

      validMiddleStops.forEach((stop: any) => {
        const svc = stop.service;
        const baseAddress = svc?.address || "";

        allStops.push(formatStop(
          parseFloat(svc.latitude),
          parseFloat(svc.longitude),
          baseAddress
        ));
      });

      // Retorno SEMPRE incluído como último stop.
      // isRouteOptimized deve ser false — com true, a Lalamove elimina o retorno
      // quando igual à partida, calculando apenas metade do trajeto.
      if (endPoint) {
        allStops.push(formatStop(endPoint.lat, endPoint.lng, endPoint.address));
      }

      if (allStops.length < 2) {
        throw new Error(
          `São necessárias ao menos 2 paradas válidas para calcular o frete. ` +
          `Verifique se a base operacional e os endereços foram configurados corretamente.`
        );
      }

      const response = await supabase.functions.invoke('lalamove-proxy', {
        body: {
          method: 'POST',
          path: '/v3/quotations',
          payload: {
            data: {
              scheduleAt: new Date(Date.now() + 15 * 60000).toISOString(),
              serviceType: selectedVehicle,
              specialRequests: [],
              language: "pt_BR",
              stops: allStops,
              isRouteOptimized: false
            }
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao gerar cotação");
      }

      if (response.data?.error) {
        const lalamoveErrors = response.data.error?.errors;
        const msg = lalamoveErrors?.map((e: any) => `${e.id}: ${e.message}`).join(', ')
          || JSON.stringify(response.data.error);
        throw new Error(`Lalamove: ${msg}`);
      }

      // Salva cotação junto com os stops intermediários para uso no pedido
      setQuotation({ ...response.data, _middleStops: validMiddleStops });
      setOrder(null); // limpa pedido anterior
      toast({ title: "Cotação gerada", description: "Valores atualizados com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro na cotação", description: error.message, variant: "destructive" });
    } finally {
      setLoadingQuotation(false);
    }
  };

  // ─── CONTRATAR ENTREGADOR ─────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (!quotation?.data) return;
    setPlacingOrder(true);

    try {
      const qData = quotation.data;
      const stops: any[] = qData.stops;

      // Remetente = primeiro stop (partida)
      const senderStopId = stops[0]?.stopId;
      const senderName = settings?.company_name || "Roterizador";
      const senderPhone = normalizeBrPhone(settings?.company_phone);

      if (!senderPhone) {
        throw new Error("Configure o telefone da empresa em Configurações → Base Operacional antes de contratar.");
      }

      // Destinatários = todos os stops EXCETO o primeiro (partida)
      // Para cada stop intermediário, mapeia os dados do serviço correspondente
      const middleStops: any[] = quotation._middleStops || [];
      const recipients = stops.slice(1).map((lalamoveStop: any, idx: number) => {
        const svc = middleStops[idx]?.service;
        // Último stop é o retorno (sem serviço vinculado) — usa dados da empresa
        const isReturnStop = !svc;

        // Tenta usar o telefone do cliente, se for inválido, faz fallback para o da empresa
        let phone = normalizeBrPhone(svc?.phone);
        if (!phone) {
          phone = senderPhone;
        }

        const currentHour = new Date().getHours();
        const limitTime = currentHour < 13 ? "13:30" : "18:30";

        const routeRules = `--- IMPORTANTE ---

ROTA EXCLUSIVA PARA MOTOCICLISTAS

FINALIZAR A ROTA ATÉ ${limitTime} HORAS
Realizar todas as entregas e coletas de cartuchos e toners dentro desse horário.

PAGAMENTO: Quando houver indicação de pagamento, é obrigatório receber o valor no local da entrega com nossa maquina de cartão.

AO CHEGAR AO LOCAL: Informar que está realizando uma entrega ou coleta em nome da Reciclo Suprimentos.

DÚVIDAS OU IMPREVISTOS:
Entrar em contato pelo telefone fixo: (31) 3226-3662.`;

        // ── Monta o campo name: Código | Nome | Complemento | Obs (sem obs em coletas) ──
        let name: string;
        if (isReturnStop) {
          name = senderName;
        } else {
          const customerName = svc?.customer_name || senderName;
          const isColeta = svc?.type === 'coleta';
          const typePrefix = isColeta ? 'COLETA ' : '';
          const codigo = svc?.service_id ? `#${typePrefix}${svc.service_id}` : '';
          const complemento = svc?.complement?.trim() || '';
          // Para coletas, F.PAGTO. não se aplica — ignora o campo de observações
          const obs = isColeta ? '' : (svc?.observations?.replace(/\n|\r/g, ' ').trim() || '');
          const nameParts = [codigo, customerName, complemento, obs].filter(Boolean);
          name = nameParts.join(' | ').substring(0, 255);
        }

        // remarks = instruções gerais da rota, enviadas APENAS na parada de retorno
        const remarks = isReturnStop ? routeRules.trim().substring(0, 1500) : "";

        return {
          stopId: lalamoveStop.stopId,
          name,
          phone,
          ...(remarks ? { remarks } : {}),
        };
      });

      const response = await supabase.functions.invoke('lalamove-proxy', {
        body: {
          method: 'POST',
          path: '/v3/orders',
          payload: {
            data: {
              quotationId: qData.quotationId,
              sender: {
                stopId: senderStopId,
                name: senderName,
                phone: senderPhone,
              },
              recipients,
              isPODEnabled: true,
              metadata: {
                routeId: id,
                routeName: route?.name,
              }
            }
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao criar pedido");
      }

      if (response.data?.error) {
        const msg = response.data.error?.errors
          ?.map((e: any) => `${e.id}: ${e.message}`).join(', ')
          || JSON.stringify(response.data.error);
        throw new Error(`Lalamove: ${msg}`);
      }

      const orderData = response.data?.data;
      setOrder(orderData);

      if (orderData?.orderId) {
        // Persistir na nova tabela lalamove_orders
        const { data: newOrder, error: orderError } = await supabase.from('lalamove_orders').insert({
          order_id: orderData.orderId,
          route_id: id,
          status: 'ASSIGNING'
        }).select().single();
        
        if (orderError) {
          console.error("Erro ao salvar lalamove_orders", orderError);
        } else if (newOrder) {
          // Persistir os stops na lalamove_order_stops
          const stopsToInsert = stops.slice(1).map((lalamoveStop: any, idx: number) => {
            const svc = middleStops[idx]?.service;
            return {
              lalamove_order_id: newOrder.id,
              service_id: svc?.id || null,
              stop_id: lalamoveStop.stopId,
              position: idx   // posição 0-based entre as paradas de entrega (sem o stop de coleta)
            };
          }).filter((s: any) => s.service_id); // Garante que só salva paradas vinculadas a serviços
          
          if (stopsToInsert.length > 0) {
            const { error: stopsError } = await supabase.from('lalamove_order_stops').insert(stopsToInsert);
            if (stopsError) {
              console.error("Erro ao salvar lalamove_order_stops", stopsError);
            }
          }
        }
      }

      toast({
        title: "Pedido criado!",
        description: `Motorista sendo encontrado. Pedido #${orderData?.orderId}`,
      });
    } catch (error: any) {
      toast({ title: "Erro ao contratar", description: error.message, variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

  useEffect(() => {
    if (route && settings) {
      getQuotation();
    }
  }, [route, settings, selectedVehicle]);

  useEffect(() => {
    if (route?.route_stops) {
      const invalids = route.route_stops
        .filter((stop: any) => stop.service)
        .map((stop: any) => {
          const rawPhone = stop.service?.phone;
          const isValid = !!normalizeBrPhone(rawPhone);
          return {
            id: stop.id,
            serviceId: stop.service?.id,
            name: stop.service?.customer_name,
            phone: rawPhone || '',
            isValid
          };
        })
        .filter((item: any) => !item.isValid);

      setInvalidPhones(invalids);
      const initialEditing: Record<string, string> = {};
      invalids.forEach((inv: any) => {
        initialEditing[inv.serviceId] = inv.phone;
      });
      setEditingPhones(initialEditing);
      
      if (invalids.length === 0) {
        setIgnoreInvalidPhones(false);
      }
    }
  }, [route]);

  const handleSavePhone = async (serviceId: string) => {
    const newPhone = editingPhones[serviceId];
    if (!newPhone) return;
    
    setSavingPhones(true);
    try {
      const { error } = await supabase
        .from('services')
        .update({ phone: newPhone })
        .eq('id', serviceId);
        
      if (error) throw error;
      
      toast({ title: "Telefone atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["route", id] });
    } catch (err: any) {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    } finally {
      setSavingPhones(false);
    }
  };

  if (loadingRoute) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const startLabel =
    route?.start_location_type === "operational_base"
      ? settings?.operational_base_address || "Base Operacional"
      : startServiceData
        ? `${startServiceData.customer_name} — ${startServiceData.address}${startServiceData.complement ? ` (${startServiceData.complement})` : ''}`
        : "Carregando...";

  const endLabel =
    route?.end_location_type === "operational_base"
      ? settings?.operational_base_address || "Base Operacional"
      : endServiceData
        ? `${endServiceData.customer_name} — ${endServiceData.address}${endServiceData.complement ? ` (${endServiceData.complement})` : ''}`
        : "Carregando...";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">

        {/* Painel Esquerdo */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/routes')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Integração Lalamove</h1>
              <p className="text-sm text-gray-500">Configurando entrega para: {route?.name}</p>
            </div>
          </div>

          {/* Validação de Telefones */}
          {invalidPhones.length > 0 && !ignoreInvalidPhones && (
            <Card className="border-orange-200 shadow-sm bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-lg">Atenção: Telefones Inválidos</CardTitle>
                </div>
                <CardDescription className="text-orange-600/80">
                  A Lalamove exige números de telefone válidos (com DDD). Corrija os números abaixo para o motorista poder ligar em caso de imprevistos, ou opte por usar o telefone da sua Base Operacional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invalidPhones.map((inv) => (
                    <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-md border border-orange-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{inv.name}</p>
                        <p className="text-xs text-red-500 line-through">Inválido: {inv.phone || '(vazio)'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Ex: 31999999999" 
                          value={editingPhones[inv.serviceId] || ''}
                          onChange={(e) => setEditingPhones(prev => ({ ...prev, [inv.serviceId]: e.target.value }))}
                          className="w-40 h-8 text-sm"
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleSavePhone(inv.serviceId)}
                          disabled={savingPhones || !editingPhones[inv.serviceId] || editingPhones[inv.serviceId] === inv.phone}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button 
                      variant="default" 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => setIgnoreInvalidPhones(true)}
                    >
                      Usar telefone da Base Operacional para os restantes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seleção de Veículo */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Selecione o Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {VEHICLE_OPTIONS.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center text-center transition-all ${
                      selectedVehicle === vehicle.id
                        ? 'border-[#f27421] bg-[#f27421]/5'
                        : 'border-gray-200 hover:border-[#f27421]/30'
                    }`}
                  >
                    <vehicle.icon className={`h-8 w-8 mb-2 ${selectedVehicle === vehicle.id ? 'text-[#f27421]' : 'text-gray-500'}`} />
                    <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                    <p className="text-xs text-gray-500">{vehicle.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rota Completa */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Rota Completa</CardTitle>
              <CardDescription>Ordem de paradas enviada à Lalamove</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Partida */}
                <div className="flex items-start space-x-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-green-50 text-green-600 flex items-center justify-center">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-green-700 uppercase tracking-wide">Partida</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{startLabel}</p>
                  </div>
                </div>

                {/* Paradas Intermediárias */}
                {route?.route_stops?.map((stop: any, index: number) => (
                  <div key={stop.id} className="flex items-start space-x-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-vibe-blue/10 text-vibe-blue flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{stop.service?.customer_name}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{stop.service?.address}</p>
                      {stop.service?.observations && (
                        <p className="text-[11px] text-gray-500 mt-1 italic bg-gray-50 p-1.5 rounded border border-gray-100">
                          Obs: {stop.service.observations}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {stop.service?.complement && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            <MapPin className="h-3 w-3 mr-1" />
                            {stop.service.complement}
                          </span>
                        )}
                        {stop.service?.phone && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            <Phone className="h-3 w-3 mr-1" />
                            {stop.service.phone}
                          </span>
                        )}
                      </div>
                      
                      {(!stop.service?.latitude || !stop.service?.longitude) && (
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium mt-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Sem coordenadas — ignorada
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Retorno */}
                <div className="flex items-start space-x-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-orange-700 uppercase tracking-wide">Retorno</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{endLabel}</p>
                    {endLabel === startLabel && (
                      <p className="text-xs text-gray-400 mt-1">Mesmo endereço de partida</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel Direito: Resumo */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm sticky top-24">
            <CardHeader className="bg-[#f27421] text-white rounded-t-lg">
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription className="text-white/80">Valores oficiais Lalamove</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Pedido já criado */}
              {order ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Pedido criado!</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Pedido #:</strong> {order.orderId}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Total:</strong> R$ {order.priceBreakdown?.total}</p>
                  </div>
                  {order.shareLink && (
                    <a
                      href={order.shareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#f27421] hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Rastrear entrega
                    </a>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setOrder(null); getQuotation(); }}
                  >
                    Nova Cotação
                  </Button>
                </div>

              ) : loadingQuotation ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#f27421]" />
                  <p className="text-sm text-gray-500">Calculando rota...</p>
                </div>

              ) : quotation?.data ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Distância Total</span>
                    <span className="font-semibold">{(parseInt(quotation.data.distance.value) / 1000).toFixed(1)} km</span>
                  </div>

                  <div className="space-y-2 py-2 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor Base</span>
                      <span>R$ {quotation.data.priceBreakdown.base}</span>
                    </div>
                    {quotation.data.priceBreakdown.extraMileage !== "0" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quilometragem Extra</span>
                        <span>R$ {quotation.data.priceBreakdown.extraMileage}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-[#f27421]">
                      R$ {quotation.data.priceBreakdown.total}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-[#f27421] hover:bg-[#d1611a] text-white h-12 text-lg font-bold"
                    onClick={() => setIsConfirmHireOpen(true)}
                    disabled={placingOrder || (invalidPhones.length > 0 && !ignoreInvalidPhones)}
                  >
                    {placingOrder ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" />Contratando...</>
                    ) : invalidPhones.length > 0 && !ignoreInvalidPhones ? (
                      "Resolva os telefones primeiro"
                    ) : (
                      "Contratar Entregador"
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Ao confirmar, o valor será debitado da sua carteira Lalamove.
                  </p>
                </div>

              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>Não foi possível gerar a cotação.</p>
                  <p className="text-xs mt-2">Verifique se a base operacional está configurada e se os endereços foram geocodificados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={isConfirmHireOpen} onOpenChange={setIsConfirmHireOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Contratação</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a despachar esta rota para a Lalamove. O valor de{" "}
              <strong className="text-gray-900">R$ {quotation?.data?.priceBreakdown?.total}</strong>{" "}
              será debitado da sua carteira Lalamove e o motorista será acionado.
              Tem certeza que deseja prosseguir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setIsConfirmHireOpen(false);
                placeOrder();
              }} 
              className="bg-[#f27421] hover:bg-[#d1611a] text-white"
            >
              Confirmar Contratação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LalamoveIntegrationPage;
