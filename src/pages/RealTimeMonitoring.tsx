import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentsList } from "@/components/monitoring/AgentsList";
import { AgentLocationMap } from "@/components/monitoring/AgentLocationMap";
import { MapControls } from "@/components/monitoring/MapControls";
import { Navigation } from "@/components/Navigation";
import { useAgentsData } from "@/hooks/useAgentsData";

export default function RealTimeMonitoring() {
  const [showAgents, setShowAgents] = useState(true);
  const [showBases, setShowBases] = useState(false);
  const [showServices, setShowServices] = useState(true);
  const [showUnassignedServices, setShowUnassignedServices] = useState(false);

  const { data: agents, isLoading } = useAgentsData();

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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Agents List */}
        <div className="w-3/5 h-full overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Agentes em Campo
            </h2>
            <div className="text-sm text-gray-500">
              {agents?.length || 0} agentes ativos
            </div>
          </div>
          <div className="space-y-4">
            <AgentsList agents={agents || []} />
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-2/5 relative">
          <AgentLocationMap
            agents={agents || []}
            showAgents={showAgents}
            showBases={showBases}
            showServices={showServices}
            showUnassignedServices={showUnassignedServices}
          />
          <MapControls
            showAgents={showAgents}
            setShowAgents={setShowAgents}
            showBases={showBases}
            setShowBases={setShowBases}
            showServices={showServices}
            setShowServices={setShowServices}
            showUnassignedServices={showUnassignedServices}
            setShowUnassignedServices={setShowUnassignedServices}
          />
        </div>
      </div>
    </div>
  );
}