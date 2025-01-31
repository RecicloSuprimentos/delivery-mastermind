import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

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
      const { data: systemUsers, error: usersError } = await supabase
        .from("system_users")
        .select("*")
        .eq("user_type", "agent")
        .eq("is_active", true);

      if (usersError) throw usersError;

      const agentsWithRoutes = await Promise.all(
        (systemUsers || []).map(async (user) => {
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
            .eq("is_active", true);

          if (routesError) throw routesError;

          const { data: lastLocation } = await supabase
            .from("agent_locations")
            .select("*")
            .eq("agent_id", user.id)
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle();

          const route = routes?.[0];
          const totalServices = route?.route_stops?.length || 0;
          const completedServices = route?.route_stops?.filter(
            (stop) => stop.service?.status === "completed"
          ).length || 0;

          return {
            id: user.id,
            name: user.name,
            status: lastLocation ? "online" : "offline",
            completedServices,
            totalServices,
            collections: route?.route_stops?.filter(
              (stop) => stop.service?.type === "coleta"
            ).length || 0,
            deliveries: route?.route_stops?.filter(
              (stop) => stop.service?.type === "entrega"
            ).length || 0,
            pendingServices: totalServices - completedServices,
            onTimePerformance: totalServices > 0 ? (completedServices / totalServices) * 100 : 0,
            currentLocation: lastLocation
              ? {
                  latitude: lastLocation.latitude,
                  longitude: lastLocation.longitude,
                }
              : undefined,
            timeline: route?.route_stops?.map((stop, index) => ({
              id: stop.id,
              serviceNumber: index + 1,
              status: stop.service?.status === "completed"
                ? "completed"
                : index === completedServices
                ? "current"
                : "pending",
              estimatedTime: stop.estimated_arrival_time,
              actualTime: stop.service?.status === "completed"
                ? stop.estimated_departure_time
                : undefined,
            })) || [],
          };
        })
      );

      return agentsWithRoutes;
    },
    refetchInterval: 30000,
  });
};