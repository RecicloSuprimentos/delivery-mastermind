
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRouteQuery = (routeId?: string) => {
  const { data: route } = useQuery({
    queryKey: ["route", routeId],
    queryFn: async () => {
      if (!routeId) return null;
      
      // Buscar rota com seus serviços relacionados
      const { data, error } = await supabase
        .from("routes")
        .select(`
          *,
          route_stops (
            *,
            service:services(*)
          )
        `)
        .eq("id", routeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!routeId,
  });

  return {
    route,
  };
};
