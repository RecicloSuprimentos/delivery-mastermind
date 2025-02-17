
import type { Service } from "@/types/routes";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      try {
        // Atualiza o status do serviço para not-assigned
        const { error } = await supabase
          .from('services')
          .update({ status: 'not-assigned', assigned_to: null })
          .eq('id', serviceId);

        if (error) {
          console.error("Erro ao atualizar status do serviço:", error);
          toast({
            title: "Erro",
            description: "Não foi possível remover o serviço da rota.",
            variant: "destructive",
          });
          return;
        }

        // Remove o serviço da lista de paradas
        onStopsChange(selectedStops.filter(s => s.id !== serviceId));

        toast({
          title: "Sucesso",
          description: "Serviço removido da rota com sucesso.",
        });
      } catch (error) {
        console.error("Erro ao remover serviço:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao remover o serviço da rota.",
          variant: "destructive",
        });
      }
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
