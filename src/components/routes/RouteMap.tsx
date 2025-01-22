import { useEffect, useMemo, useState } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { MapMarkers } from "./map/MapMarkers";
import { MapDirections } from "./map/MapDirections";
import { RouteStats } from "./RouteStats";
import type { Service, SystemSettings } from "@/types/routes";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333,
};

interface RouteMapProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: "operational_base" | "service";
  endLocationType: "operational_base" | "service";
  selectedStartService?: Service;
  selectedEndService?: Service;
  onRouteStats?: (distance: number, duration: number) => void;
  onOptimizedStops?: (stops: Service[]) => void;
}

export const RouteMap = ({
  settings,
  selectedStops,
  startLocationType,
  endLocationType,
  selectedStartService,
  selectedEndService,
  onRouteStats,
  onOptimizedStops,
}: RouteMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [routeStats, setRouteStats] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: settings?.google_maps_key || "",
  });

  const center = useMemo(() => {
    if (settings?.operational_base_latitude && settings?.operational_base_longitude) {
      return {
        lat: Number(settings.operational_base_latitude),
        lng: Number(settings.operational_base_longitude),
      };
    }
    return defaultCenter;
  }, [settings]);

  const handleRouteStats = (distance: number, duration: number) => {
    setRouteStats({ distance, duration });
    if (onRouteStats) {
      onRouteStats(distance, duration);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div className="relative h-full rounded-lg border bg-background shadow">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        onLoad={setMap}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {map && (
          <>
            <MapMarkers
              settings={settings}
              selectedStops={selectedStops}
              startLocationType={startLocationType}
              endLocationType={endLocationType}
              selectedStartService={selectedStartService}
              selectedEndService={selectedEndService}
            />
            
            <MapDirections
              map={map}
              settings={settings}
              selectedStops={selectedStops}
              startLocationType={startLocationType}
              endLocationType={endLocationType}
              selectedStartService={selectedStartService}
              selectedEndService={selectedEndService}
              onRouteStats={handleRouteStats}
              onOptimizedStops={onOptimizedStops}
            />
          </>
        )}
      </GoogleMap>

      {routeStats && (
        <div className="absolute bottom-4 left-4 right-4">
          <RouteStats
            distance={routeStats.distance}
            duration={routeStats.duration}
          />
        </div>
      )}
    </div>
  );
};