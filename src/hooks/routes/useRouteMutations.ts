
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRouteBasicMutations } from "./mutations/useRouteBasicMutations";
import { useRouteStopsMutations } from "./mutations/useRouteStopsMutations";
import { useServiceStatusMutations } from "./mutations/useServiceStatusMutations";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useRouteMutations = (routeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateRouteData, createNewRoute } = useRouteBasicMutations(routeId);
  const { fetchExistingStops, removeStops, addNewStops, updateStopsSequence } = useRouteStopsMutations();
  const { updateServicesStatus } = useServiceStatusMutations();

  const saveRoute = useMutation({
    mutationFn: async ({ routeData, stops }: { routeData: RouteInsert, stops: { service_id: string }[] }) => {
      if (routeId) {
        // Modo Edição
        console.log("[DEBUG] Iniciando edição de rota", { routeId, routeData, stops });
        
        // 0. Pegar a rota antiga para saber quais eram os serviços de Início e Fim
        const { data: oldRoute } = await supabase.from('routes').select('*').eq('id', routeId).single();

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

        // 4. Identificar mudanças de serviços (incluindo início e fim)
        const currentServiceIds = Array.from(new Set([
          ...existingStops.map(stop => stop.service_id),
          oldRoute?.start_location_type === 'service' ? oldRoute.start_location_reference : null,
          oldRoute?.end_location_type === 'service' ? oldRoute.end_location_reference : null
        ].filter(Boolean) as string[]));

        const newServiceIds = Array.from(new Set([
          ...stops.map(stop => stop.service_id),
          routeData.start_location_type === 'service' ? routeData.start_location_reference : null,
          routeData.end_location_type === 'service' ? routeData.end_location_reference : null
        ].filter(Boolean) as string[]));
        
        const removedServices = currentServiceIds.filter(id => !newServiceIds.includes(id));
        const addedServices = newServiceIds.filter(id => !currentServiceIds.includes(id));
        
        console.log("[DEBUG] Análise de mudanças globais:", { removedServices, addedServices, isRouteInProgress });

        // 5. Atualizar sequência das paradas intermediárias sempre
        const updatedStops = stops.map((stop, index) => ({
          service_id: stop.service_id,
          sequence_number: index + 1,
        }));
        await updateStopsSequence(routeId, updatedStops);

        // 6. Atualizar status dos serviços removidos (inclusive se era Início/Fim e foi removido)
        if (removedServices.length > 0) {
          await updateServicesStatus(removedServices, "not-assigned");
        }

        // 7. Atualizar status dos novos serviços (inclusive Início/Fim novos)
        if (addedServices.length > 0) {
          const newStatus = isRouteInProgress ? "accepted" : "assigned";
          await updateServicesStatus(addedServices, newStatus);
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
        }
        
        const allServiceIds = Array.from(new Set([
          ...stops.map(s => s.service_id),
          routeData.start_location_type === 'service' ? routeData.start_location_reference : null,
          routeData.end_location_type === 'service' ? routeData.end_location_reference : null
        ].filter(Boolean) as string[]));

        if (allServiceIds.length > 0) {
          await updateServicesStatus(allServiceIds, "assigned");
        }
        
        return newRoute;
      }
    },
    onSuccess: () => {
      console.log("[DEBUG] Operação concluída com sucesso - Invalidando cache");
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast({
        title: "Sucesso",
        description: "Rota salva com sucesso",
      });
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
