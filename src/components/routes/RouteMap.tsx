import { useRef } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { RouteStats } from "./RouteStats";
import { MapMarkers } from "./map/MapMarkers";
import { MapDirections } from "./map/MapDirections";
import { MapControls } from "./map/MapControls";
import { useMapDirections } from "./map/useMapDirections";
import { useMapConfiguration } from "./map/useMapConfiguration";
import type { Service, SystemSettings } from "@/types/routes";

interface RouteMapProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: string;
  endLocationType: string;
  selectedStartService?: Service;
  selectedEndService?: Service;
  onRouteStats?: (distance: number, duration: number, estimatedTimes: Date[]) => void;
  onOptimizedStops?: (stops: Service[]) => void;
  shouldOptimize?: boolean;
  isInverted?: boolean;
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
  shouldOptimize = false,
  isInverted = false,
}: RouteMapProps) => {
  const mapRef = useRef<google.maps.Map>();
  const { center, mapOptions } = useMapConfiguration(settings);
  
  const directions = useMapDirections({
    settings,
    selectedStops,
    startLocationType,
    endLocationType,
    selectedStartService,
    selectedEndService,
    onRouteStats,
    onOptimizedStops,
    shouldOptimize,
    isInverted,
  });

  const handleMapLoad = (map: google.maps.Map) => {
    console.log("Map loaded successfully");
    mapRef.current = map;
  };

  return (
    <div className="h-full rounded-lg overflow-hidden border border-gray-200 relative">
      <GoogleMap
        onLoad={handleMapLoad}
        mapContainerClassName="w-full h-full"
        options={mapOptions}
        center={center}
        zoom={13}
      >
        {mapRef.current && (
          <>
            <MapControls map={mapRef.current} center={center} />
            <MapDirections directions={directions} />
            <MapMarkers 
              startLocationType={startLocationType}
              settings={settings}
              selectedStops={selectedStops}
            />
          </>
        )}
      </GoogleMap>
      {directions?.routes[0]?.legs && (
        <RouteStats
          distance={directions.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0)}
          duration={directions.routes[0].legs.reduce((acc, leg) => acc + leg.duration.value, 0)}
          estimatedTimes={selectedStops.map((_, index) => new Date())}
          stops={selectedStops}
        />
      )}
    </div>
  );
};