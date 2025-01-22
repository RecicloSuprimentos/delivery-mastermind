import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ServiceCardActions } from "./service/ServiceCardActions";
import { ServiceCardDetails } from "./service/ServiceCardDetails";
import { useServices } from "@/hooks/useServices";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  phone: string;
  email?: string;
  complement?: string;
  time_window?: string;
  observations?: string;
  status: string;
}

interface ServiceCardProps {
  service: Service;
  onUpdate: () => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ServiceCard = ({ service, onUpdate, isSelected, onSelect }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteService, updateServiceStatus } = useServices();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteService.mutateAsync(service.id);
        onUpdate();
        toast({
          title: "Sucesso",
          description: "Serviço excluído com sucesso",
        });
      } catch (error) {
        console.error("Error deleting service:", error);
        toast({
          title: "Erro",
          description: "Não é possível excluir este serviço pois ele está atribuído a uma rota",
          variant: "destructive",
        });
      }
    }
  };

  const handleUnassign = async () => {
    if (window.confirm("Tem certeza que deseja desatribuir este serviço?")) {
      try {
        await updateServiceStatus.mutateAsync({
          serviceId: service.id,
          status: "not-assigned"
        });
        onUpdate();
        toast({
          title: "Sucesso",
          description: "Serviço desatribuído com sucesso",
        });
      } catch (error) {
        console.error("Error unassigning service:", error);
        toast({
          title: "Erro",
          description: "Erro ao desatribuir o serviço",
          variant: "destructive",
        });
      }
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(service.id);
    }
  };

  return (
    <Card className={`mb-2 overflow-hidden ${isSelected ? 'border-primary border-2' : 'bg-white'}`}>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          {service.status === "not-assigned" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSelect}
              className={`${isSelected ? "text-primary" : "text-gray-500"} -ml-2`}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 ml-2">
            <div className="font-medium text-base">
              {service.type === "coleta" ? "COLETA" : "ENTREGA"} {service.service_id}
            </div>
            <div className="font-medium text-base">{service.customer_name}</div>
          </div>
          
          {(service.status === "not-assigned" || service.status === "assigned") && (
            <ServiceCardActions
              serviceId={service.id}
              status={service.status}
              onDelete={handleDelete}
              onUnassign={handleUnassign}
            />
          )}
        </div>

        <ServiceCardDetails
          address={service.address}
          phone={service.phone}
          timeWindow={service.time_window}
          observations={service.observations}
          isExpanded={isExpanded}
        />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 mt-2"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
    </Card>
  );
};

export default ServiceCard;