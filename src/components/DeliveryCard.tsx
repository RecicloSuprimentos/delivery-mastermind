import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import CustomerInfoFields from "./CustomerInfoFields";
import AddressFields from "./AddressFields";
import ServiceCardHeader from "./ServiceCardHeader";
import ServiceIdField from "./ServiceIdField";
import ServiceFormActions from "./ServiceFormActions";

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

  const handleObservationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservations(e.target.value.toUpperCase());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white">
      <ServiceCardHeader onClose={onClose} />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <ServiceIdField
            serviceId={serviceId}
            serviceType={serviceType}
            onServiceIdChange={setServiceId}
            onServiceTypeChange={setServiceType}
          />

          <CustomerInfoFields
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            phone={phone}
            onPhoneChange={setPhone}
            email={email}
            onEmailChange={setEmail}
          />

          <AddressFields
            address={address}
            onAddressChange={setAddress}
            onLocationSelect={setLocation}
            complement={complement}
            onComplementChange={setComplement}
            timeWindow={timeWindow}
            onTimeWindowChange={setTimeWindow}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              value={observations}
              onChange={handleObservationsChange}
              placeholder="Informações adicionais"
              className="resize-none"
            />
          </div>

          <ServiceFormActions onClose={onClose} />
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryCard;