
import { supabase } from "@/integrations/supabase/client";

export interface RouteStop {
  service_id: string;
  sequence_number: number;
  services?: {
    status: string;
  };
}

export const useRouteStopsMutations = () => {
  const fetchExistingStops = async (routeId: string) => {
    const { data, error } = await supabase
      .from("route_stops")
      .select(`
        service_id,
        sequence_number,
        services (
          status
        )
      `)
      .eq("route_id", routeId)
      .order('sequence_number', { ascending: true });

    if (error) throw error;
    return data as RouteStop[];
  };

  const removeStops = async (routeId: string, stopIds: string[]) => {
    const { error } = await supabase
      .from("route_stops")
      .delete()
      .eq("route_id", routeId)
      .in("service_id", stopIds);

    if (error) throw error;
  };

  const addNewStops = async (routeId: string, stops: { service_id: string; sequence_number: number }[]) => {
    const { error } = await supabase
      .from("route_stops")
      .insert(stops.map(stop => ({
        route_id: routeId,
        service_id: stop.service_id,
        sequence_number: stop.sequence_number,
      })));

    if (error) throw error;
  };

  return {
    fetchExistingStops,
    removeStops,
    addNewStops,
  };
};
