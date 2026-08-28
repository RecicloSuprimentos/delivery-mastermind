import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Service } from "@/types/routes";

export const useRouteData = (routeId?: string) => {
  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("user_type", "agent");

      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["available_services", routeId],
    queryFn: async () => {
      // Busca servicos nao-atribuidos
      const { data: notAssigned, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "not-assigned");

      if (error) throw error;

      let extraServices: Service[] = [];

      // Se estiver editando uma rota existente, busca tambem os servicos ja vinculados a ela
      if (routeId) {
        const { data: routeData } = await supabase
          .from("routes")
          .select(`
            start_location_type,
            start_location_reference,
            end_location_type,
            end_location_reference,
            route_stops(service_id)
          `)
          .eq("id", routeId)
          .single();

        if (routeData) {
          const idsToFetch: string[] = [];

          // Paradas intermediarias
          routeData.route_stops?.forEach((s: any) => {
            if (s.service_id) idsToFetch.push(s.service_id);
          });

          // Servico de Inicio
          if (routeData.start_location_type === "service" && routeData.start_location_reference) {
            idsToFetch.push(routeData.start_location_reference);
          }

          // Servico de Fim
          if (routeData.end_location_type === "service" && routeData.end_location_reference) {
            idsToFetch.push(routeData.end_location_reference);
          }

          if (idsToFetch.length > 0) {
            const { data: assigned } = await supabase
              .from("services")
              .select("*")
              .in("id", idsToFetch);

            if (assigned) extraServices = assigned as Service[];
          }
        }
      }

      // Mesclar evitando duplicatas
      const all = [...(notAssigned as Service[] || [])];
      extraServices.forEach(svc => {
        if (!all.find(s => s.id === svc.id)) {
          all.push(svc);
        }
      });

      return all;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["system_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return {
    agents,
    services,
    settings,
  };
};
