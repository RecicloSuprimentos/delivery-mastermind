import { useEffect, useRef, useState } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { RouteStats } from "./RouteStats";
import { getLocationFromType } from "@/utils/mapUtils";
import { optimizeRoute } from "@/utils/routeOptimization";
import { MapMarkers } from "./map/MapMarkers";
import { MapDirections } from "./map/MapDirections";
import type { Location, Service, SystemSettings } from "@/types/routes";

interface RouteMapProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: string;
  endLocationType: string;
  selectedStartService?: Service;
  selectedEndService?: Service;
  onRouteStats?: (distance: number, duration: number, estimatedTimes: Date[]) => void;
}

export const RouteMap = ({ 
  settings,
  selectedStops,
  startLocationType,
  endLocationType,
  selectedStartService,
  selectedEndService,
  onRouteStats,
}: RouteMapProps) => {
  const mapRef = useRef<google.maps.Map>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [center] = useState<Location>({ 
    lat: settings?.operational_base_latitude || -23.5505, 
    lng: settings?.operational_base_longitude || -46.6333 
  });

  useEffect(() => {
    if (!window.google || !settings) return;

    const directionsService = new google.maps.DirectionsService();
    const startLocation = getLocationFromType(startLocationType, settings, selectedStartService);
    const endLocation = getLocationFromType(endLocationType, settings, selectedEndService);

    if (!startLocation || !endLocation) return;

    optimizeRoute(
      directionsService,
      startLocation,
      endLocation,
      selectedStops,
      settings.service_default_duration
    )
      .then(({ directions, totalDistance, totalDuration, estimatedTimes }) => {
        setDirections(directions);
        if (onRouteStats) {
          onRouteStats(totalDistance, totalDuration, estimatedTimes);
        }
      })
      .catch(error => {
        console.error("Error calculating route:", error);
      });
  }, [selectedStops, settings, startLocationType, endLocationType, selectedStartService, selectedEndService, onRouteStats]);

  const mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "cooperative",
    disableDefaultUI: false,
    clickableIcons: false,
  };

  return (
    <div className="h-full rounded-lg overflow-hidden border border-gray-200 relative">
      <GoogleMap
        zoom={13}
        center={center}
        mapContainerClassName="w-full h-full"
        options={mapOptions}
        onLoad={(map) => { mapRef.current = map; }}
      >
        <MapDirections directions={directions} />
        <MapMarkers 
          startLocationType={startLocationType}
          settings={settings}
          selectedStops={selectedStops}
        />
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