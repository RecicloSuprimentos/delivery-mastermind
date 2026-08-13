import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import CustomerInfoFields from "./CustomerInfoFields";
import AddressFields from "./AddressFields";
import ServiceCardHeader from "./ServiceCardHeader";
import ServiceIdField from "./ServiceIdField";
import ServiceFormActions from "./ServiceFormActions";
import { validateServiceForm } from "@/utils/serviceValidation";
import { useQueryClient } from "@tanstack/react-query";

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
  const [serviceType, setServiceType] = useState<"coleta" | "entrega" | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchService = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          toast({
            title: "Erro",
            description: "Erro ao carregar serviço",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setServiceId(data.service_id);
          setAddress(data.address);
          setLocation(data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : null);
          setCustomerName(data.customer_name);
          setPhone(data.phone);
          setEmail(data.email || "");
          setComplement(data.complement || "");
          setTimeWindow(data.time_window || "");
          setObservations(data.observations || "");
          setServiceType(data.type);
        }
      }
    };

    fetchService();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de serviço",
        variant: "destructive",
      });
      return;
    }

    const validationError = validateServiceForm(serviceType, location, customerName, phone, address);
    if (validationError) {
      toast({
        title: "Erro",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      const generatedServiceId = serviceId || Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const serviceData: any = {
        type: serviceType,
        service_id: generatedServiceId,
        customer_name: customerName,
        phone,
        email,
        address,
        complement,
        time_window: timeWindow,
        observations,
        latitude: location?.lat,
        longitude: location?.lng,
      };

      if (!id) {
        serviceData.status = "not-assigned";
      }

      let error;

      if (id) {
        ({ error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", id));
      } else {
        ({ error } = await supabase
          .from("services")
          .insert([serviceData]));
      }

      if (error) {
        console.error("Error saving service:", error);
        throw error;
      }

      // Invalidate and refetch services query
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      await queryClient.invalidateQueries({ queryKey: ["services-kanban"] });

      toast({
        title: "Sucesso",
        description: id ? "Serviço atualizado com sucesso!" : "Serviço criado com sucesso!",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error saving service:", error);
      
      let errorMessage = "Erro ao salvar serviço. Verifique se todos os campos estão preenchidos corretamente.";
      
      if (error?.code === '23505') {
        const failedId = serviceId || "gerado automaticamente";
        errorMessage = `Significa que o service_id (Código do Serviço) "${failedId}" já existe cadastrado na sua tabela de serviços!`;
      }

      toast({
        title: "Erro ao criar serviço",
        description: errorMessage,
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

          <ServiceFormActions onClose={onClose} isEditing={!!id} />
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryCard;