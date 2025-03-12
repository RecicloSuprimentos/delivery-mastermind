
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

  const findRouteIdByServiceId = async (serviceId: string) => {
    const { data, error } = await supabase
      .from("route_stops")
      .select("route_id")
      .eq("service_id", serviceId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') return null; // PGRST116 é o código para "no rows returned"
    return data?.route_id;
  };

  const removeServiceFromRoute = async (serviceId: string) => {
    // 1. Encontrar a qual rota o serviço pertence
    const routeId = await findRouteIdByServiceId(serviceId);
    if (!routeId) return null; // Serviço não está em nenhuma rota

    // 2. Buscar todas as paradas da rota para reorganizar
    const existingStops = await fetchExistingStops(routeId);
    
    // 3. Remover o serviço específico
    const removedStop = existingStops.find(stop => stop.service_id === serviceId);
    if (!removedStop) return null;
    
    const remainingStops = existingStops.filter(stop => stop.service_id !== serviceId);
    
    // 4. Reorganizar a sequência das paradas restantes
    const reorganizedStops = remainingStops.map((stop, index) => ({
      service_id: stop.service_id,
      sequence_number: index + 1,
    }));

    // 5. Atualizar a sequência de paradas na rota
    await updateStopsSequence(routeId, reorganizedStops);
    
    return {
      routeId,
      removedServiceId: serviceId,
      remainingStopsCount: reorganizedStops.length
    };
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

  const updateStopsSequence = async (routeId: string, stops: { service_id: string; sequence_number: number }[]) => {
    // Primeiro, removemos todas as paradas existentes
    const { error: deleteError } = await supabase
      .from("route_stops")
      .delete()
      .eq("route_id", routeId);

    if (deleteError) throw deleteError;

    // Depois, inserimos as paradas com a nova sequência
    const { error: insertError } = await supabase
      .from("route_stops")
      .insert(stops.map(stop => ({
        route_id: routeId,
        service_id: stop.service_id,
        sequence_number: stop.sequence_number,
      })));

    if (insertError) throw insertError;
  };

  return {
    fetchExistingStops,
    removeStops,
    addNewStops,
    updateStopsSequence,
    removeServiceFromRoute,
    findRouteIdByServiceId,
  };
};
