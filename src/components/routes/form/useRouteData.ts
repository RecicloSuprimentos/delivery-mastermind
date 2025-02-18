
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

interface UseRouteDataProps {
  routeId?: string | null;
  initialData?: RouteInsert | null;
  onDataLoaded: (data: {
    routeData?: RouteInsert;
    stops?: Service[];
    status?: string;
  }) => void;
}

export const useRouteData = ({ routeId, initialData, onDataLoaded }: UseRouteDataProps) => {
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
    queryKey: ["available_services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "not-assigned");

      if (error) throw error;
      return data as Service[];
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

  useEffect(() => {
    // Se temos dados iniciais, usamos eles
    if (initialData) {
      onDataLoaded({
        routeData: initialData,
        stops: [],
        status: initialData.status
      });
      return;
    }

    // Se temos um routeId, buscamos os dados da rota
    if (routeId) {
      const fetchRoute = async () => {
        const { data: routeData, error: routeError } = await supabase
          .from("routes")
          .select("*")
          .eq("id", routeId)
          .single();

        if (routeError) {
          console.error("Error fetching route:", routeError);
          return;
        }

        if (routeData) {
          const { data: stopsData } = await supabase
            .from("route_stops")
            .select("*, service:services(*)")
            .eq("route_id", routeId)
            .order("sequence_number");

          const stops = stopsData?.map((stop: any) => stop.service) || [];

          onDataLoaded({
            routeData,
            stops,
            status: routeData.status
          });
        }
      };

      fetchRoute();
    }
  }, [routeId, initialData, onDataLoaded]);

  return {
    agents,
    services,
    settings
  };
};
