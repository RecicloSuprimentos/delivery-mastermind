
import { useState, memo } from "react";
import { Check, ChevronDown, ChevronUp, SendToBack, PackageCheck } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ServiceCardActions } from "./service/ServiceCardActions";
import { ServiceCardDetails } from "./service/ServiceCardDetails";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/types/services";

interface ServiceCardProps {
  service: Service;
  onUpdate: () => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ServiceCard = memo(({ service, onUpdate, isSelected, onSelect }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteService, updateServiceStatus } = useServices();

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteService.mutateAsync(service.id);
        onUpdate();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleUnassign = async () => {
    if (window.confirm("Tem certeza que deseja desatribuir este serviço? Ele será removido da rota associada.")) {
      try {
        await updateServiceStatus.mutateAsync({
          serviceId: service.id,
          status: "not-assigned"
        });
        onUpdate();
      } catch (error) {
        console.error("Error unassigning service:", error);
      }
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(service.id);
    }
  };

  const isCollection = service.type === "coleta";
  const Icon = isCollection ? SendToBack : PackageCheck;
  const iconColor = isCollection ? "text-blue-600" : "text-green-600";
  const showSelectButton = service.status === "not-assigned";

  return (
    <Card className={`overflow-hidden ${isSelected ? 'border-primary border-2' : 'bg-white'}`}>
      <div className="p-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1">
            {showSelectButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSelect}
                className={`${isSelected ? "text-primary" : "text-gray-500"} p-1`}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <div className={`${iconColor} flex items-center justify-center`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-sm">
                {service.type === "coleta" ? "COLETA" : "ENTREGA"} {service.service_id}
              </div>
              <div className="font-medium text-sm">{service.customer_name}</div>
            </div>
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
          status={service.status}
          agentName={service.assigned_to?.name}
          completionDetails={service.completion_details}
          failureDetails={service.failure_details}
        />

        <div className="flex justify-end mt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
});

ServiceCard.displayName = "ServiceCard";
export default ServiceCard;
