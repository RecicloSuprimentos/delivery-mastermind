import { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface AgentLocationMapProps {
  agents: Agent[];
  showAgents: boolean;
  showBases: boolean;
  showServices: boolean;
  showUnassignedServices: boolean;
}

const defaultCenter = {
  lat: -19.9167,
  lng: -43.9345,
};

export function AgentLocationMap({
  agents,
  showAgents,
  showBases,
  showServices,
  showUnassignedServices,
}: AgentLocationMapProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  useEffect(() => {
    if (map && agents.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      agents.forEach((agent) => {
        if (agent.currentLocation) {
          bounds.extend({
            lat: agent.currentLocation.latitude,
            lng: agent.currentLocation.longitude,
          });
        }
      });
      map.fitBounds(bounds);
      // Ajusta o zoom para uma visão mais ampla
      map.setZoom(Math.min(map.getZoom() || 12, 12));
    }
  }, [map, agents]);

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={defaultCenter}
      zoom={11}
      onLoad={onLoad}
      options={{
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        maxZoom: 16,
        minZoom: 8,
      }}
    >
      {showAgents &&
        agents.map((agent) => {
          if (!agent.currentLocation) return null;
          return (
            <Marker
              key={agent.id}
              position={{
                lat: agent.currentLocation.latitude,
                lng: agent.currentLocation.longitude,
              }}
              onClick={() => setSelectedAgent(agent)}
              icon={{
                path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                fillColor: "#2563eb",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#ffffff",
                scale: 1.5,
              }}
            />
          );
        })}

      {selectedAgent && (
        <InfoWindow
          position={{
            lat: selectedAgent.currentLocation?.latitude || 0,
            lng: selectedAgent.currentLocation?.longitude || 0,
          }}
          onCloseClick={() => setSelectedAgent(null)}
        >
          <div>
            <h3 className="font-medium">{selectedAgent.name}</h3>
            <p className="text-sm text-gray-500">Em serviço</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}