
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
      console.log("Iniciando salvamento da rota com otimização:", { routeData, routeId, stops });
      
      let savedRoute;
      
      // Se for edição, mantenha o status existente
      if (routeId) {
        const { data: existingRoute } = await supabase
          .from("routes")
          .select("status")
          .eq("id", routeId)
          .single();
          
        const { data, error } = await supabase
          .from("routes")
          .update({ 
            ...routeData, 
            status: existingRoute?.status || 'assigned' // Garantir um status padrão
          })
          .eq("id", routeId)
          .select()
          .single();

        if (error) throw error;
        savedRoute = data;
        
        // Atualização otimizada das paradas
        const { error: deleteError } = await supabase
          .from("route_stops")
          .delete()
          .eq("route_id", routeId);

        if (deleteError) throw deleteError;
      } else {
        // Nova rota sempre como 'assigned'
        const { data, error } = await supabase
          .from("routes")
          .insert({ ...routeData, status: 'assigned' })
          .select()
          .single();

        if (error) throw error;
        savedRoute = data;
      }
      
      // Inserir paradas em lote
      if (stops.length > 0) {
        const routeStops = stops.map((service, index) => ({
          route_id: savedRoute.id,
          service_id: service.service_id,
          sequence_number: index + 1,
        }));

        const { error: stopsError } = await supabase
          .from("route_stops")
          .insert(routeStops);

        if (stopsError) throw stopsError;

        // Atualizar status dos serviços em lote
        const { error: servicesError } = await supabase
          .from("services")
          .update({ status: "assigned" })
          .in("id", stops.map(s => s.service_id));

        if (servicesError) throw servicesError;
      }
      
      return savedRoute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
    onError: (error) => {
      console.error("Erro detalhado ao salvar rota:", error);
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
