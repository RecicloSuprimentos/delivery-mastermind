import { useToast } from "@/components/ui/use-toast";
import type { Service } from "@/types/routes";

export const useRouteValidation = () => {
  const { toast } = useToast();

  const handleRouteValidation = (routeStatus?: string) => {
    if (routeStatus === "completed") {
      toast({
        title: "Operação não permitida",
        description: "Não é possível editar uma rota finalizada.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleStopsValidation = (
    selectedStops: Service[],
    originalStops: Service[] = [],
    routeStatus?: string
  ) => {
    if (routeStatus === "assigned" || routeStatus === "accepted") {
      const hasInvalidChanges = originalStops.some(originalStop => {
        const stillExists = selectedStops.find(s => s.id === originalStop.id);
        if (stillExists && originalStop.status !== stillExists.status) {
          return true;
        }
        return false;
      });

      if (hasInvalidChanges) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível alterar o status de serviços em uma rota em andamento.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  return {
    handleRouteValidation,
    handleStopsValidation,
  };
};