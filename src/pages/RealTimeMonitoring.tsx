import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentsList } from "@/components/monitoring/AgentsList";
import { AgentLocationMap } from "@/components/monitoring/AgentLocationMap";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { startOfDay, endOfDay } from "date-fns";

interface Agent {
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

export default function RealTimeMonitoring() {
  const [showAgents, setShowAgents] = useState(true);
  const [showBases, setShowBases] = useState(false);
  const [showServices, setShowServices] = useState(true);
  const [showUnassignedServices, setShowUnassignedServices] = useState(false);

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data: systemUsers, error: usersError } = await supabase
        .from("system_users")
        .select("*")
        .eq("user_type", "agent")
        .eq("is_active", true);

      if (usersError) throw usersError;

      // Buscar rotas do dia atual para cada agente
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

          // Buscar última localização do agente
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
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Configurar canal de tempo real para atualizações de localização
  useEffect(() => {
    const channel = supabase
      .channel('agent-locations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_locations'
        },
        (payload) => {
          console.log('Nova localização:', payload);
          // Aqui você pode atualizar o estado local ou forçar um refetch
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Agents List */}
        <div className="lg:w-3/5 h-full flex flex-col">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Agentes em Campo
            </h2>
            <div className="text-sm text-gray-500">
              {agents?.length || 0} agentes ativos
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <AgentsList agents={agents || []} />
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-2/5 h-[500px] lg:h-auto relative bg-white rounded-lg shadow-sm">
          <AgentLocationMap
            agents={agents || []}
            showAgents={showAgents}
            showBases={showBases}
            showServices={showServices}
            showUnassignedServices={showUnassignedServices}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-2 text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAgents}
                  onChange={(e) => setShowAgents(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Agentes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBases}
                  onChange={(e) => setShowBases(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Bases Operacionais</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showServices}
                  onChange={(e) => setShowServices(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Serviços</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnassignedServices}
                  onChange={(e) => setShowUnassignedServices(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Serviços não atribuídos</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}