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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Agents List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4">
          <AgentsList agents={agents || []} />
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          <AgentLocationMap
            agents={agents || []}
            showAgents={showAgents}
            showBases={showBases}
            showServices={showServices}
            showUnassignedServices={showUnassignedServices}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showAgents}
                  onChange={(e) => setShowAgents(e.target.checked)}
                />
                <span>Agentes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showBases}
                  onChange={(e) => setShowBases(e.target.checked)}
                />
                <span>Bases Operacionais</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showServices}
                  onChange={(e) => setShowServices(e.target.checked)}
                />
                <span>Serviços</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnassignedServices}
                  onChange={(e) => setShowUnassignedServices(e.target.checked)}
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