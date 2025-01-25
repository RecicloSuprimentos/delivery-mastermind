import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useRoutes = (routeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: route, isLoading: isLoadingRoute } = useQuery({
    queryKey: ["route", routeId],
    queryFn: async () => {
      if (!routeId) return null;
      
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("id", routeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!routeId,
  });

  const { data: routeStops } = useQuery({
    queryKey: ["route_stops", routeId],
    queryFn: async () => {
      if (!routeId) return null;

      const { data, error } = await supabase
        .from("route_stops")
        .select("*, service:services(*)")
        .eq("route_id", routeId)
        .order("sequence_number");

      if (error) throw error;
      return data;
    },
    enabled: !!routeId,
  });

  const saveRoute = useMutation({
    mutationFn: async (routeData: RouteInsert) => {
      if (routeId) {
        const { data, error } = await supabase
          .from("routes")
          .update(routeData)
          .eq("id", routeId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("routes")
          .insert(routeData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast({
        title: "Sucesso",
        description: routeId ? "Rota atualizada com sucesso!" : "Rota criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a rota.",
        variant: "destructive",
      });
    },
  });

  const updateRouteStatus = useMutation({
    mutationFn: async ({ routeId, status }: { routeId: string; status: string }) => {
      console.log("Updating route status:", { routeId, status });

      // Primeiro atualiza o status da rota
      const { data: route, error: routeError } = await supabase
        .from("routes")
        .update({ status })
        .eq("id", routeId)
        .select()
        .single();

      if (routeError) throw routeError;

      // Se o status for 'accepted', atualiza os serviços vinculados
      if (status === 'accepted') {
        console.log("Route accepted, updating services...");
        
        // Busca todos os serviços vinculados a esta rota
        const { data: routeStops, error: stopsError } = await supabase
          .from("route_stops")
          .select("service_id")
          .eq("route_id", routeId);

        if (stopsError) throw stopsError;

        if (routeStops && routeStops.length > 0) {
          const serviceIds = routeStops.map(stop => stop.service_id);
          
          // Atualiza o status de todos os serviços vinculados
          const { error: servicesError } = await supabase
            .from("services")
            .update({ status: 'accepted' })
            .in("id", serviceIds);

          if (servicesError) throw servicesError;
        }
      }

      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Sucesso",
        description: "Status da rota atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error updating route status:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status da rota.",
        variant: "destructive",
      });
    },
  });

  return {
    route,
    routeStops,
    isLoadingRoute,
    saveRoute,
    updateRouteStatus,
  };
};