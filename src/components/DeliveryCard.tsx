import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ServiceTypeSelector from "./delivery/ServiceTypeSelector";
import CustomerInfoFields from "./delivery/CustomerInfoFields";
import AddressFields from "./delivery/AddressFields";

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryCardProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const DeliveryCard = ({ onSuccess, onClose }: DeliveryCardProps) => {
  const [serviceId, setServiceId] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [complement, setComplement] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [observations, setObservations] = useState("");
  const [serviceType, setServiceType] = useState<"coleta" | "entrega" | "">("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceType) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o tipo de serviço",
        variant: "destructive",
      });
      return;
    }

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
    <Card className="w-full max-w-2xl mx-auto bg-white relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      )}
      <CardHeader>
        <CardTitle>Novo Serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-6">
            <ServiceTypeSelector
              value={serviceType}
              onChange={setServiceType}
            />
            <div className="flex-1">
              <Input
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="ID do serviço (opcional)"
              />
            </div>
          </div>

          <CustomerInfoFields
            customerName={customerName}
            setCustomerName={setCustomerName}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
          />

          <AddressFields
            address={address}
            setAddress={setAddress}
            complement={complement}
            setComplement={setComplement}
            timeWindow={timeWindow}
            setTimeWindow={setTimeWindow}
            onLocationSelect={handleLocationSelect}
          />

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