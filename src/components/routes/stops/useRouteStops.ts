
import type { Service } from "@/types/routes";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRouteStopsMutations } from "@/hooks/routes/mutations/useRouteStopsMutations";

interface UseRouteStopsProps {
  services: Service[];
  selectedStops: Service[];
  onStopsChange: (stops: Service[]) => void;
  disabled?: boolean;
  selectedStartService?: string;
  selectedEndService?: string;
}

export const useRouteStops = ({
  services,
  selectedStops,
  onStopsChange,
  disabled,
  selectedStartService,
  selectedEndService,
}: UseRouteStopsProps) => {
  const { toast } = useToast();
  const { removeServiceFromRoute } = useRouteStopsMutations();

  const getAvailableServices = () => {
    return services.filter(
      service => 
        !selectedStops.find(s => s.id === service.id) &&
        service.id !== selectedStartService &&
        service.id !== selectedEndService
    );
  };

  const handleAddStop = (service: Service) => {
    if (!selectedStops.find(s => s.id === service.id) && !disabled) {
      onStopsChange([...selectedStops, service]);
    }
  };

  const handleAddAllStops = () => {
    if (disabled) return;
    
    const availableServices = getAvailableServices();
    
    onStopsChange([...selectedStops, ...availableServices]);
  };

  const handleRemoveStop = async (serviceId: string) => {
    if (disabled) return;

    try {
      // Primeiro remove o serviço da lista de paradas
      const updatedStops = selectedStops.filter(s => s.id !== serviceId);
      onStopsChange(updatedStops);

      // Depois atualiza o status do serviço para not-assigned
      const { error } = await supabase
        .from('services')
        .update({ status: 'not-assigned', assigned_to: null })
        .eq('id', serviceId);

      if (error) {
        console.error("Erro ao atualizar status do serviço:", error);
        // Reverte a remoção em caso de erro
        onStopsChange(selectedStops);
        toast({
          title: "Erro",
          description: "Não foi possível remover o serviço da rota.",
          variant: "destructive",
        });
        return;
      }

      // Remover o serviço da rota no banco de dados
      await removeServiceFromRoute(serviceId);

      toast({
        title: "Sucesso",
        description: "Serviço removido da rota com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
      // Reverte a remoção em caso de erro
      onStopsChange(selectedStops);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o serviço da rota.",
        variant: "destructive",
      });
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

  return {
    handleAddStop,
    handleAddAllStops,
    handleRemoveStop,
    handleInvertStops,
    getAvailableServices,
  };
};
