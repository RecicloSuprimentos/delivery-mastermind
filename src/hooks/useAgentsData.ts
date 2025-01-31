import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";

export interface AgentData {
  id: string;
  name: string;
  status: "online" | "offline" | "in-transit" | "arrived";
  completedServices: number;
  totalServices: number;
  collections: number;
  deliveries: number;
  pendingServices: number;
  onTimePerformance: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  timeline: {
    id: string;
    serviceNumber: number;
    status: "completed" | "current" | "pending";
    estimatedTime: string;
    actualTime?: string;
  }[];
}

export const useAgentsData = () => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  return useQuery({
    queryKey: ["agents-data"],
    queryFn: async () => {
      // Buscar agentes ativos
      const { data: systemUsers, error: usersError } = await supabase
        .from("system_users")
        .select("*")
        .eq("user_type", "agent")
        .eq("is_active", true);

      if (usersError) throw usersError;

      const agentsWithRoutes = await Promise.all(
        (systemUsers || []).map(async (user) => {
          // Buscar rota ativa do dia para o agente
          const { data: routes, error: routesError } = await supabase
            .from("routes")
            .select(`
              *,
              route_stops(
                *,
                service:services(*)
              )
            `)
            .eq("agent_id", user.id)
            .gte("start_time", startOfToday.toISOString())
            .lte("start_time", endOfToday.toISOString())
            .eq("is_active", true)
            .maybeSingle();

          if (routesError) throw routesError;

          // Buscar última localização conhecida
          const { data: lastLocation } = await supabase
            .from("agent_locations")
            .select("*")
            .eq("agent_id", user.id)
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Calcular métricas
          const routeStops = routes?.route_stops || [];
          const totalServices = routeStops.length;
          const completedServices = routeStops.filter(
            (stop) => stop.service?.status === "completed"
          ).length;

          const collections = routeStops.filter(
            (stop) => stop.service?.type === "coleta"
          ).length;

          const deliveries = routeStops.filter(
            (stop) => stop.service?.type === "entrega"
          ).length;

          const pendingServices = totalServices - completedServices;

          // Calcular performance de tempo
          let onTimeServices = 0;
          routeStops.forEach((stop) => {
            if (stop.service?.status === "completed" && stop.estimated_arrival_time) {
              const estimatedTime = parseISO(stop.estimated_arrival_time);
              const actualTime = stop.estimated_departure_time 
                ? parseISO(stop.estimated_departure_time)
                : null;
              
              if (actualTime && actualTime <= estimatedTime) {
                onTimeServices++;
              }
            }
          });

          const onTimePerformance = totalServices > 0 
            ? (onTimeServices / totalServices) * 100 
            : 0;

          // Determinar status do agente
          let status: AgentData["status"] = "offline";
          if (lastLocation) {
            const currentStop = routeStops[completedServices];
            if (currentStop?.service?.status === "arrived") {
              status = "arrived";
            } else if (completedServices < totalServices) {
              status = "in-transit";
            }
          }

          // Construir timeline
          const timeline = routeStops.map((stop, index) => ({
            id: stop.id,
            serviceNumber: index + 1,
            status: stop.service?.status === "completed"
              ? "completed"
              : index === completedServices
              ? "current"
              : "pending",
            estimatedTime: stop.estimated_arrival_time 
              ? format(parseISO(stop.estimated_arrival_time), "HH:mm")
              : "",
            actualTime: stop.service?.status === "completed" && stop.estimated_departure_time
              ? format(parseISO(stop.estimated_departure_time), "HH:mm")
              : undefined,
          }));

          return {
            id: user.id,
            name: user.name,
            status,
            completedServices,
            totalServices,
            collections,
            deliveries,
            pendingServices,
            onTimePerformance,
            currentLocation: lastLocation
              ? {
                  latitude: lastLocation.latitude,
                  longitude: lastLocation.longitude,
                }
              : undefined,
            timeline,
          };
        })
      );

      return agentsWithRoutes;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};