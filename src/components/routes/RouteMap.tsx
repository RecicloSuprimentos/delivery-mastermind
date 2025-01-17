import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { RouteStats } from "./RouteStats";
import { Package, ArrowDown } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
}

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  time_window?: string;
}

interface SystemSettings {
  operational_base_address: string;
  operational_base_latitude: number;
  operational_base_longitude: number;
  service_default_duration: number;
}

interface RouteMapProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: string;
  endLocationType: string;
  selectedStartService?: Service;
  selectedEndService?: Service;
}

export const RouteMap = ({ 
  settings,
  selectedStops,
  startLocationType,
  endLocationType,
  selectedStartService,
  selectedEndService,
}: RouteMapProps) => {
  const mapRef = useRef<google.maps.Map>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const getStartLocation = (): Location | null => {
    if (startLocationType === "operational_base" && settings) {
      return {
        lat: settings.operational_base_latitude,
        lng: settings.operational_base_longitude,
      };
    } else if (startLocationType === "service" && selectedStartService) {
      return {
        lat: selectedStartService.latitude,
        lng: selectedStartService.longitude,
      };
    }
    return null;
  };

  const getEndLocation = (): Location | null => {
    if (endLocationType === "operational_base" && settings) {
      return {
        lat: settings.operational_base_latitude,
        lng: settings.operational_base_longitude,
      };
    } else if (endLocationType === "service" && selectedEndService) {
      return {
        lat: selectedEndService.latitude,
        lng: selectedEndService.longitude,
      };
    }
    return null;
  };

  useEffect(() => {
    if (!window.google || selectedStops.length === 0) return;

    const directionsService = new google.maps.DirectionsService();
    const startLocation = getStartLocation();
    const endLocation = getEndLocation();

    if (!startLocation || !endLocation) return;

    const waypoints = selectedStops.map(stop => ({
      location: { lat: stop.latitude, lng: stop.longitude },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: startLocation,
        destination: endLocation,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          // Add service duration to the total duration
          if (result && settings?.service_default_duration) {
            const totalServiceDuration = (selectedStops.length + 2) * settings.service_default_duration * 60; // Convert minutes to seconds
            const legs = result.routes[0].legs;
            const totalDuration = legs.reduce((acc, leg) => acc + leg.duration!.value, 0) + totalServiceDuration;
            result.routes[0].legs[0].duration = {
              text: `${Math.round(totalDuration / 60)} mins`,
              value: totalDuration
            };
          }
          setDirections(result);
        } else {
          console.error(`Erro ao calcular rota: ${status}`);
        }
      }
    );
  }, [selectedStops, settings, startLocationType, endLocationType, selectedStartService, selectedEndService]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (settings) {
      map.setCenter({
        lat: settings.operational_base_latitude,
        lng: settings.operational_base_longitude,
      });
      map.setZoom(13);
    }
  };

  return (
    <div className="h-full rounded-lg overflow-hidden border border-gray-200 relative">
      <GoogleMap
        zoom={13}
        center={settings ? {
          lat: settings.operational_base_latitude,
          lng: settings.operational_base_longitude,
        } : { lat: -23.5505, lng: -46.6333 }}
        mapContainerClassName="w-full h-full"
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={onLoad}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
            }}
          />
        )}
        
        {settings && startLocationType === "operational_base" && (
          <Marker
            position={{
              lat: settings.operational_base_latitude,
              lng: settings.operational_base_longitude,
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#0EA5E9",
              fillOpacity: 1,
              strokeColor: "#0369A1",
              strokeWeight: 2,
            }}
            label="Base"
          />
        )}

        {selectedStops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            label={`${index + 1}`}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: stop.type === "coleta" ? "#F97316" : "#9333EA",
              fillOpacity: 1,
              strokeColor: stop.type === "coleta" ? "#C2410C" : "#6B21A8",
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
      {directions?.routes[0]?.legs && (
        <RouteStats
          distance={directions.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0)}
          duration={directions.routes[0].legs.reduce((acc, leg) => acc + leg.duration.value, 0)}
        />
      )}
    </div>
  );
};