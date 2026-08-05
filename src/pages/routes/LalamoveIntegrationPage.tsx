import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Bike, Car, Truck, Home, MapPin, RotateCcw, CheckCircle, ExternalLink } from "lucide-react";

const VEHICLE_OPTIONS = [
  { id: 'LALAGO', name: 'Moto', icon: Bike, description: 'Até 20kg' },
  { id: 'CAR', name: 'Carro', icon: Car, description: 'Até 200kg' },
  { id: 'VAN', name: 'Van', icon: Truck, description: 'Até 500kg' },
];

// ─── Utilitário: normaliza telefone BR para formato internacional E.164 ───────
// Entrada: "(31)99183-3103" | "31991833103" | "+5531991833103"
// Saída:   "+5531991833103"
const normalizeBrPhone = (raw: string): string => {
  if (!raw) return "";
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, "");
  // Já tem DDI 55?
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  // Tem DDD (10 ou 11 dígitos)?
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  // Caso desconhecido — retorna como veio (lalamove vai rejeitar se inválido)
  return raw;
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

  const [selectedVehicle, setSelectedVehicle] = useState('LALAGO');
  const [quotation, setQuotation] = useState<any>(null);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [order, setOrder] = useState<any>(null);

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
        allStops.push(formatStop(
          parseFloat(stop.service.latitude),
          parseFloat(stop.service.longitude),
          stop.service.address || ""
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
      const senderPhone = normalizeBrPhone(settings?.company_phone || "");

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
        
        const name  = svc?.customer_name || senderName;
        const phone = normalizeBrPhone(svc?.phone || settings?.company_phone || "");

        // Textos condicionais da rota (regras gerais)
        const currentHour = new Date().getHours();
        const limitTime = currentHour < 13 ? "13:30" : "18:30";
        
        const routeRules = `FINALIZAR A ROTA ATÉ ${limitTime} HORAS – ENTREGA E COLETA DE CARTUCHOS E TONERS

NECESSÁRIO RECEBER O PAGAMENTO NO LOCAL, QUANDO INFORMADO.

AO CHEGAR NO LOCAL, INFORMAR QUE ESTÁ REALIZANDO UMA ENTREGA/COLETA PARA A RECICLO SUPRIMENTOS.

EM CASO DE DÚVIDAS OU IMPREVISTOS, LIGAR PARA O TELEFONE FIXO: (31) 3226-3662.`;

        // Monta remarks
        const parts: string[] = [];
        
        if (isReturnStop) {
          // Na parada final de retorno à base, colocamos as INSTRUÇÕES GERAIS
          parts.push(`--- INSTRUÇÕES GERAIS ---\r\n${routeRules}`);
        } else {
          // Nas paradas de entrega, colocamos APENAS complemento e observação do destino
          if (svc?.complement) parts.push(`Complemento: ${svc.complement}`);
          if (svc?.observations) parts.push(`Obs do local: ${svc.observations.trim()}`);
        }

        const remarks = parts.join("\r\n\r\n").substring(0, 1500);

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

      setOrder(response.data?.data);
      toast({
        title: "Pedido criado!",
        description: `Motorista sendo encontrado. Pedido #${response.data?.data?.orderId}`,
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
      : `Serviço: ${route?.start_location_reference}`;

  const endLabel =
    route?.end_location_type === "operational_base"
      ? settings?.operational_base_address || "Base Operacional"
      : `Serviço: ${route?.end_location_reference}`;

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
              <div className="space-y-2">
                {/* Partida */}
                <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-green-700 uppercase tracking-wide">Partida</p>
                    <p className="text-sm text-gray-900">{startLabel}</p>
                  </div>
                </div>

                {/* Paradas Intermediárias */}
                {route?.route_stops?.map((stop: any, index: number) => (
                  <div key={stop.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{stop.service?.customer_name}</p>
                      <p className="text-xs text-gray-500">{stop.service?.address}</p>
                      {stop.service?.complement && (
                        <p className="text-xs text-blue-600 mt-0.5">📍 {stop.service.complement}</p>
                      )}
                      {stop.service?.phone && (
                        <p className="text-xs text-gray-400 mt-0.5">📞 {stop.service.phone}</p>
                      )}
                      {(!stop.service?.latitude || !stop.service?.longitude) && (
                        <p className="text-xs text-red-500 mt-1">⚠ Sem coordenadas — será ignorada no cálculo</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Retorno */}
                <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#f27421] text-white flex items-center justify-center">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-orange-700 uppercase tracking-wide">Retorno</p>
                    <p className="text-sm text-gray-900">{endLabel}</p>
                    {endLabel === startLabel && (
                      <p className="text-xs text-gray-400">Mesmo endereço de partida</p>
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
                    onClick={placeOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" />Contratando...</>
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
    </div>
  );
};

export default LalamoveIntegrationPage;
