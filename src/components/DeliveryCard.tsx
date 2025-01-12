import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AddressSearch from "./AddressSearch";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import InputMask from 'react-input-mask';
import { Label } from "@/components/ui/label";
import { GoogleMap, Marker } from "@react-google-maps/api";

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryCardProps {
  onSuccess?: () => void;
}

const DeliveryCard = ({ onSuccess }: DeliveryCardProps) => {
  const [serviceId, setServiceId] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [complement, setComplement] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [observations, setObservations] = useState("");
  const [serviceType, setServiceType] = useState<"coleta" | "entrega">("entrega");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um endereço válido",
        variant: "destructive",
      });
      return;
    }

    try {
      const generatedServiceId = serviceId || Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase.from("services").insert({
        type: serviceType,
        service_id: generatedServiceId,
        customer_name: customerName,
        phone,
        email,
        address,
        complement,
        time_window: timeWindow,
        observations,
        latitude: location.lat,
        longitude: location.lng,
        status: "not-assigned"
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso!",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-white p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-[1.35rem]">Novo Serviço</CardTitle>
        <p className="text-[0.9rem] text-muted-foreground">Preencha os dados para criar um novo serviço</p>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-8 mb-6">
            <div className="flex items-center gap-6">
              <RadioGroup
                value={serviceType}
                onValueChange={(value) => setServiceType(value as "coleta" | "entrega")}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coleta" id="coleta" />
                  <Label htmlFor="coleta" className="text-[0.9rem]">Coleta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entrega" id="entrega" />
                  <Label htmlFor="entrega" className="text-[0.9rem]">Entrega</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex-1 max-w-xs">
              <Input
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="ID do serviço (opcional)"
                className="text-[0.9rem]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[0.9rem]">Nome do Cliente</Label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome completo"
                className="text-[0.9rem]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[0.9rem]">Telefone</Label>
              <InputMask
                mask="(99) 9999*-9999"
                formatChars={{
                  '9': '[0-9]',
                  '*': '[0-9]?'
                }}
                maskChar={null}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    required
                    placeholder="(00) 0000-0000"
                    className="text-[0.9rem]"
                  />
                )}
              </InputMask>
            </div>

            <div className="space-y-2">
              <Label className="text-[0.9rem]">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="text-[0.9rem]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-[0.9rem]">Endereço</Label>
              <AddressSearch
                value={address}
                onChange={setAddress}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[0.9rem]">Complemento</Label>
              <Input
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Apartamento, sala, etc."
                className="text-[0.9rem]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="h-[300px] rounded-lg overflow-hidden">
              {location && (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={location}
                  zoom={15}
                >
                  <Marker position={location} />
                </GoogleMap>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[0.9rem]">Janela de Horário</Label>
                <InputMask
                  mask="99:99 às 99:99"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      placeholder="14:00 às 18:00"
                      className="text-[0.9rem]"
                    />
                  )}
                </InputMask>
              </div>

              <div className="space-y-2">
                <Label className="text-[0.9rem]">Observações</Label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais"
                  className="h-[180px] text-[0.9rem]"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full text-[0.9rem]">
            Criar Serviço
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryCard;