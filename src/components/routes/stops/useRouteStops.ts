
import type { Service } from "@/types/routes";
import { useToast } from "@/components/ui/use-toast";

interface UseRouteStopsProps {
  services: Service[];
  selectedStops: Service[];
  onStopsChange: (stops: Service[]) => void;
  disabled?: boolean;
}

export const useRouteStops = ({
  services,
  selectedStops,
  onStopsChange,
  disabled,
}: UseRouteStopsProps) => {
  const { toast } = useToast();

  const handleAddStop = (service: Service) => {
    if (!selectedStops.find(s => s.id === service.id) && !disabled) {
      onStopsChange([...selectedStops, service]);
    }
  };

  const handleAddAllStops = () => {
    if (disabled) return;
    
    const availableServices = services.filter(
      service => !selectedStops.find(s => s.id === service.id)
    );
    
    onStopsChange([...selectedStops, ...availableServices]);
  };

  const handleRemoveStop = async (serviceId: string) => {
    if (!disabled) {
      onStopsChange(selectedStops.filter(s => s.id !== serviceId));
    }
  };

  const handleInvertStops = () => {
    if (!disabled && selectedStops.length > 1) {
      // Separa os serviços completados dos não completados
      const completedStops = selectedStops.filter(stop => stop.status === "completed");
      const pendingStops = selectedStops.filter(stop => stop.status !== "completed");
      
      // Inverte apenas os serviços pendentes
      const invertedPendingStops = [...pendingStops].reverse();
      
      // Combina os serviços completados com os pendentes invertidos
      onStopsChange([...completedStops, ...invertedPendingStops]);
    }
  };

  const getAvailableServices = () => {
    return services.filter(service => !selectedStops.find(s => s.id === service.id));
  };

  return {
    handleAddStop,
    handleAddAllStops,
    handleRemoveStop,
    handleInvertStops,
    getAvailableServices,
  };
};
