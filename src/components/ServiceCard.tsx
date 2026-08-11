import { useState, memo } from "react";
import { Check, ChevronDown, ChevronUp, SendToBack, PackageCheck } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ServiceCardActions } from "./service/ServiceCardActions";
import { ServiceCardDetails } from "./service/ServiceCardDetails";
import { ServiceDetailsDialog } from "./service/ServiceDetailsDialog";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/types/services";
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

interface ServiceCardProps {
  service: Service;
  onUpdate: () => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ServiceCard = memo(({ service, onUpdate, isSelected, onSelect }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);
  
  const { deleteService, updateServiceStatus } = useServices();

  const confirmDelete = async () => {
    try {
      await deleteService.mutateAsync(service.id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const confirmUnassign = async () => {
    try {
      await updateServiceStatus.mutateAsync({
        serviceId: service.id,
        status: "not-assigned"
      });
      onUpdate();
    } catch (error) {
      console.error("Error unassigning service:", error);
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(service.id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita abrir o modal se o usuário clicou em um botão (checkbox, ações, expandir) ou dentro do dropdown
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]')) {
      return;
    }
    setIsModalOpen(true);
  };

  const isCollection = service.type === "coleta";
  const Icon = isCollection ? SendToBack : PackageCheck;
  const iconColor = isCollection ? "text-blue-600" : "text-green-600";
  const showSelectButton = service.status === "not-assigned";

  return (
    <>
      <Card 
        className={`overflow-hidden transition-all duration-200 border-none shadow-sm hover:shadow-md cursor-pointer ${isSelected ? 'ring-2 ring-vibe-blue/50 bg-blue-50/30' : 'bg-white'}`}
        onClick={handleCardClick}
      >
        <div className="p-3">
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
                onDelete={() => setIsDeleteDialogOpen(true)}
                onUnassign={() => setIsUnassignDialogOpen(true)}
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

      <ServiceDetailsDialog 
        service={service}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Desatribuir Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desatribuir este serviço? Ele será removido da rota associada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnassign}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

ServiceCard.displayName = "ServiceCard";
export default ServiceCard;
