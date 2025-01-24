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

  return {
    route,
    routeStops,
    isLoadingRoute,
    saveRoute,
  };
};