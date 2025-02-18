
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useRouteMutations = (routeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveRoute = useMutation({
    mutationFn: async ({ routeData, stops }: { routeData: RouteInsert, stops: { service_id: string }[] }) => {
      console.log("[DEBUG] Iniciando saveRoute", { 
        routeId,
        routeData,
        stops,
        isEdit: !!routeId
      });
      
      let savedRoute;
      
      if (routeId) {
        console.log("[DEBUG] Modo edição - Buscando rota existente");
        const { data: existingRoute, error: fetchError } = await supabase
          .from("routes")
          .select(`
            id,
            status,
            route_stops (
              service_id
            )
          `)
          .eq("id", routeId)
          .single();
          
        if (fetchError) {
          console.error("[DEBUG] Erro ao buscar rota existente:", fetchError);
          throw fetchError;
        }

        console.log("[DEBUG] Rota existente encontrada:", existingRoute);
          
        const { data, error } = await supabase
          .from("routes")
          .update({ 
            ...routeData, 
            status: existingRoute?.status || 'assigned'
          })
          .eq("id", routeId)
          .select()
          .single();

        if (error) {
          console.error("[DEBUG] Erro ao atualizar rota:", error);
          throw error;
        }
        
        console.log("[DEBUG] Rota atualizada com sucesso:", data);
        savedRoute = data;
        
        console.log("[DEBUG] Removendo paradas antigas");
        const { error: deleteError } = await supabase
          .from("route_stops")
          .delete()
          .eq("route_id", routeId);

        if (deleteError) {
          console.error("[DEBUG] Erro ao deletar paradas antigas:", deleteError);
          throw deleteError;
        }

        // Resetar status dos serviços antigos
        if (existingRoute?.route_stops) {
          console.log("[DEBUG] Resetando status dos serviços antigos");
          const oldServiceIds = existingRoute.route_stops.map(stop => stop.service_id);
          
          const { error: resetError } = await supabase
            .from("services")
            .update({ status: "not-assigned" })
            .in("id", oldServiceIds);

          if (resetError) {
            console.error("[DEBUG] Erro ao resetar status dos serviços:", resetError);
            throw resetError;
          }
        }
      } else {
        console.log("[DEBUG] Modo criação - Inserindo nova rota");
        const { data, error } = await supabase
          .from("routes")
          .insert({ ...routeData, status: 'assigned' })
          .select()
          .single();

        if (error) {
          console.error("[DEBUG] Erro ao criar nova rota:", error);
          throw error;
        }
        
        console.log("[DEBUG] Nova rota criada:", data);
        savedRoute = data;
      }
      
      if (stops.length > 0) {
        console.log("[DEBUG] Inserindo novas paradas");
        const routeStops = stops.map((service, index) => ({
          route_id: savedRoute.id,
          service_id: service.service_id,
          sequence_number: index + 1,
        }));

        const { error: stopsError } = await supabase
          .from("route_stops")
          .insert(routeStops);

        if (stopsError) {
          console.error("[DEBUG] Erro ao inserir novas paradas:", stopsError);
          throw stopsError;
        }

        console.log("[DEBUG] Atualizando status dos novos serviços");
        const { error: servicesError } = await supabase
          .from("services")
          .update({ status: "assigned" })
          .in("id", stops.map(s => s.service_id));

        if (servicesError) {
          console.error("[DEBUG] Erro ao atualizar status dos serviços:", servicesError);
          throw servicesError;
        }
      }
      
      return savedRoute;
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
