import { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useMapConfiguration } from "../routes/map/useMapConfiguration";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface AgentLocation {
  id: string;
  agent_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  agent: {
    name: string;
  };
}

export const AgentLocationMap = () => {
  const [locations, setLocations] = useState<AgentLocation[]>([]);
  const { center, mapOptions } = useMapConfiguration();

  useEffect(() => {
    // Buscar localizações iniciais
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('agent_locations')
        .select(`
          *,
          agent:system_users(name)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar localizações:', error);
        return;
      }

      setLocations(data || []);
    };

    fetchLocations();

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('agent-locations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_locations'
        },
        async (payload) => {
          // Buscar dados completos do agente
          const { data: agentData } = await supabase
            .from('system_users')
            .select('name')
            .eq('id', payload.new.agent_id)
            .single();

          const newLocation = {
            ...payload.new,
            agent: agentData
          } as AgentLocation;

          setLocations(prev => [newLocation, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-[calc(100vh-12rem)] rounded-lg overflow-hidden border border-gray-200">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        options={mapOptions}
        center={center}
        zoom={13}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{
              lat: location.latitude,
              lng: location.longitude
            }}
            icon={{
              path: MapPin,
              fillColor: "#0EA5E9",
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: "#0369A1",
              scale: 1.5
            }}
            title={`${location.agent?.name} - ${new Date(location.timestamp).toLocaleString()}`}
          />
        ))}
      </GoogleMap>
    </div>
  );
};