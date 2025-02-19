
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouteBasicMutations } from "./mutations/useRouteBasicMutations";
import { useRouteStopsMutations } from "./mutations/useRouteStopsMutations";
import { useServiceStatusMutations } from "./mutations/useServiceStatusMutations";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useRouteMutations = (routeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateRouteData, createNewRoute } = useRouteBasicMutations(routeId);
  const { fetchExistingStops, removeStops, addNewStops } = useRouteStopsMutations();
  const { updateServicesStatus } = useServiceStatusMutations();

  const saveRoute = useMutation({
    mutationFn: async ({ routeData, stops }: { routeData: RouteInsert, stops: { service_id: string }[] }) => {
      if (routeId) {
        // Modo Edição
        console.log("[DEBUG] Iniciando edição de rota", { routeId, routeData, stops });
        
        // 1. Atualizar dados da rota
        const updatedRoute = await updateRouteData(routeData);
        console.log("[DEBUG] Rota atualizada:", updatedRoute);

        // 2. Buscar paradas existentes e seus status
        const existingStops = await fetchExistingStops(routeId);
        console.log("[DEBUG] Paradas atuais:", existingStops);

        // 3. Verificar se a rota está em andamento
        const isRouteInProgress = existingStops.some(stop => 
          stop.services?.status === "in-transit" || stop.services?.status === "completed"
        );
        console.log("[DEBUG] Rota em andamento:", isRouteInProgress);

        // 4. Identificar mudanças nos serviços
        const currentStops = existingStops.map(stop => stop.service_id);
        const newStops = stops.map(stop => stop.service_id);
        
        const removedStops = currentStops.filter(id => !newStops.includes(id));
        const addedStops = newStops.filter(id => !currentStops.includes(id));
        
        console.log("[DEBUG] Análise de mudanças:", { removedStops, addedStops, isRouteInProgress });

        // 5. Atualizar status dos serviços removidos
        if (removedStops.length > 0) {
          console.log("[DEBUG] Atualizando status dos serviços removidos");
          await updateServicesStatus(removedStops, "not-assigned");
          await removeStops(routeId, removedStops);
        }

        // 6. Adicionar novas paradas
        if (addedStops.length > 0) {
          const maxSequence = existingStops.reduce((max, stop) => 
            Math.max(max, stop.sequence_number), 0);

          const newRouteStops = stops
            .filter(stop => addedStops.includes(stop.service_id))
            .map((service, index) => ({
              service_id: service.service_id,
              sequence_number: maxSequence + index + 1,
            }));

          await addNewStops(routeId, newRouteStops);

          // Atualizar status dos novos serviços
          const newStatus = isRouteInProgress ? "accepted" : "assigned";
          console.log("[DEBUG] Atualizando status dos novos serviços para:", newStatus);
          await updateServicesStatus(addedStops, newStatus);
        }

        return updatedRoute;
      } else {
        // Modo Criação
        console.log("[DEBUG] Modo criação - Inserindo nova rota");
        const newRoute = await createNewRoute(routeData);
        
        if (stops.length > 0) {
          const routeStops = stops.map((service, index) => ({
            service_id: service.service_id,
            sequence_number: index + 1,
          }));

          await addNewStops(newRoute.id, routeStops);
          await updateServicesStatus(stops.map(s => s.service_id), "assigned");
        }
        
        return newRoute;
      }
    },
    onSuccess: () => {
      console.log("[DEBUG] Operação concluída com sucesso - Invalidando cache");
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
    onError: (error) => {
      console.error("[DEBUG] Erro na operação:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a rota. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    },
  });

  const updateRouteStatus = useMutation({
    mutationFn: async ({ routeId, status }: { routeId: string; status: string }) => {
      const { data: route, error } = await supabase
        .from("routes")
        .update({ status })
        .eq("id", routeId)
        .select()
        .single();

      if (error) throw error;
      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  return {
    saveRoute,
    updateRouteStatus,
  };
};
