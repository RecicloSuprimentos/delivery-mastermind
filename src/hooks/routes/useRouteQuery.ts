import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRouteQuery = (routeId?: string) => {
  const { data: route } = useQuery({
    queryKey: ["route", routeId],
    queryFn: async () => {
      if (!routeId) return null;
      
      // Buscar rota com paradas intermediárias
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
      if (!data) return null;

      // Buscar separadamente os servicos de Inicio e Fim (quando for do tipo "service")
      let startService = null;
      let endService = null;

      if (data.start_location_type === "service" && data.start_location_reference) {
        const { data: svc } = await supabase
          .from("services")
          .select("*")
          .eq("id", data.start_location_reference)
          .maybeSingle();
        startService = svc;
      }

      if (data.end_location_type === "service" && data.end_location_reference) {
        const { data: svc } = await supabase
          .from("services")
          .select("*")
          .eq("id", data.end_location_reference)
          .maybeSingle();
        endService = svc;
      }

      return {
        ...data,
        start_service: startService,
        end_service: endService,
      };
    },
    enabled: !!routeId,
    staleTime: 60_000,
  });

  return {
    route,
  };
};
