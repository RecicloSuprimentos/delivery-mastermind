import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { RouteStats } from "./RouteStats";
import { createOptimizedRoute, getLocationFromType } from "@/utils/mapUtils";
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

    const waypoints = selectedStops.map(stop => ({
      location: { lat: stop.latitude, lng: stop.longitude },
      stopover: true,
    }));

    createOptimizedRoute(
      directionsService,
      startLocation,
      endLocation,
      waypoints,
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
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              preserveViewport: false,
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