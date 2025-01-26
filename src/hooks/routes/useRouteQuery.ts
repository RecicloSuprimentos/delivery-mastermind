import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRouteQuery = (routeId?: string) => {
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

  return {
    route,
    routeStops,
    isLoadingRoute,
  };
};