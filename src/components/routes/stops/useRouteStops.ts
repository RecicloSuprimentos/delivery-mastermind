
import type { Service } from "@/types/routes";
import { supabase } from "@/integrations/supabase/client";
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
      // Atualiza o status do serviço para "not-assigned"
      const { error } = await supabase
        .from("services")
        .update({ status: "not-assigned" })
        .eq("id", serviceId);

      if (error) {
        console.error("Erro ao atualizar status do serviço:", error);
        toast({
          title: "Erro",
          description: "Erro ao remover serviço da rota",
          variant: "destructive",
        });
        return;
      }

      onStopsChange(selectedStops.filter(s => s.id !== serviceId));
    }
  };

  const handleInvertStops = () => {
    if (!disabled && selectedStops.length > 1) {
      const invertedStops = [...selectedStops].reverse();
      onStopsChange(invertedStops);
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
