import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentsList } from "@/components/monitoring/AgentsList";
import { AgentLocationMap } from "@/components/monitoring/AgentLocationMap";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("user_type", "agent")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex flex-col h-screen pt-16">
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