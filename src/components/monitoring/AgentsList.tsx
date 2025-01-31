import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Agent {
  id: string;
  name: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export const AgentsList = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data: agentsData, error: agentsError } = await supabase
        .from('system_users')
        .select('*')
        .eq('user_type', 'agent');

      if (agentsError) {
        console.error('Erro ao buscar agentes:', agentsError);
        return;
      }

      // Buscar última localização para cada agente
      const agentsWithLocation = await Promise.all(
        agentsData.map(async (agent) => {
          const { data: locationData } = await supabase
            .from('agent_locations')
            .select('latitude, longitude, timestamp')
            .eq('agent_id', agent.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

          return {
            ...agent,
            lastLocation: locationData
          };
        })
      );

      setAgents(agentsWithLocation);
    };

    fetchAgents();

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('agent-locations-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_locations'
        },
        (payload) => {
          setAgents(prev => prev.map(agent => {
            if (agent.id === payload.new.agent_id) {
              return {
                ...agent,
                lastLocation: {
                  latitude: payload.new.latitude,
                  longitude: payload.new.longitude,
                  timestamp: payload.new.timestamp
                }
              };
            }
            return agent;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Agentes Ativos</h3>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{agent.name}</h4>
                  {agent.lastLocation && (
                    <div className="mt-2 space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {agent.lastLocation.latitude.toFixed(6)}, {agent.lastLocation.longitude.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(agent.lastLocation.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <Badge variant={agent.lastLocation ? "default" : "secondary"}>
                  {agent.lastLocation ? "Online" : "Offline"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};