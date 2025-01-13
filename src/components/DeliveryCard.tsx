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
    <Card className="w-full max-w-2xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Novo Serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-6">
            <RadioGroup
              value={serviceType}
              onValueChange={(value) => setServiceType(value as "coleta" | "entrega")}
              className="flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coleta" id="coleta" />
                <Label htmlFor="coleta">Coleta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entrega" id="entrega" />
                <Label htmlFor="entrega">Entrega</Label>
              </div>
            </RadioGroup>

            <div className="flex-1">
              <Input
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="ID do serviço (opcional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Cliente</label>
            <Input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <InputMask
                mask="(99) 9999*-9999"
                maskChar={null}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    required
                    placeholder="(00) 0000-0000"
                  />
                )}
              </InputMask>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <AddressSearch
              value={address}
              onChange={setAddress}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Complemento</label>
            <Input
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              placeholder="Apartamento, sala, etc."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Janela de Horário</label>
            <InputMask
              mask="99:99 às 99:99"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
            >
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  placeholder="14:00 às 18:00"
                />
              )}
            </InputMask>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Informações adicionais"
            />
          </div>

          <Button type="submit" className="w-full">
            Criar Serviço
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryCard;