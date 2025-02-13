
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import type { AgentData } from "@/types/monitoring";
import { 
  calculateCompletedServices, 
  calculateOnTimePerformance,
  buildTimeline 
} from "@/utils/agentDataUtils";
import { useEffect } from "react";

export const useAgentsData = (selectedDate: Date) => {
  const startOfSelectedDay = startOfDay(selectedDate);
  const endOfSelectedDay = endOfDay(selectedDate);

  const { data: agents, isLoading, refetch } = useQuery({
    queryKey: ["agents-data", selectedDate.toISOString()],
    queryFn: async () => {
      console.log("Buscando dados dos agentes e rotas...");
      
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
            .gte("start_time", startOfSelectedDay.toISOString())
            .lte("start_time", endOfSelectedDay.toISOString())
            .order("start_time", { ascending: true });

          if (routesError) throw routesError;

          const { data: lastLocation } = await supabase
            .from("agent_locations")
            .select("*")
            .eq("agent_id", user.id)
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle();

          const allStops = routes?.flatMap((route) => route.route_stops) || [];
          
          const {
            completedCollections,
            completedDeliveries,
            totalCompleted,
            collections,
            deliveries
          } = calculateCompletedServices(allStops);

          const onTimePerformance = calculateOnTimePerformance(allStops);
          
          let status: AgentData["status"] = "offline";
          if (lastLocation) {
            const currentStop = allStops[totalCompleted];
            if (currentStop?.service?.status === "arrived") {
              status = "arrived";
            } else if (totalCompleted < allStops.length) {
              status = "in-transit";
            }
          }

          const timeline = buildTimeline(allStops, totalCompleted);

          return {
            id: user.id,
            name: user.name,
            status,
            completedServices: totalCompleted,
            totalServices: allStops.length,
            collections,
            deliveries,
            pendingServices: allStops.length - totalCompleted,
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
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  useEffect(() => {
    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          console.log("Mudança detectada nos serviços, atualizando dados...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_locations'
        },
        () => {
          console.log("Nova localização de agente detectada, atualizando dados...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'route_stops'
        },
        () => {
          console.log("Mudança detectada nas paradas, atualizando dados...");
          refetch();
        }
      )
      .subscribe();

    // Cleanup na inscrição quando o componente for desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    data: agents,
    isLoading
  };
};
