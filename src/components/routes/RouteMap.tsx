import { useEffect, useRef, useState } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { RouteStats } from "./RouteStats";
import { getLocationFromType } from "@/utils/mapUtils";
import { optimizeRoute } from "@/utils/routeOptimization";
import { MapMarkers } from "./map/MapMarkers";
import { MapDirections } from "./map/MapDirections";
import { MapControls } from "./map/MapControls";
import type { Location, Service, SystemSettings } from "@/types/routes";

interface RouteMapProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: string;
  endLocationType: string;
  selectedStartService?: Service;
  selectedEndService?: Service;
  onRouteStats?: (distance: number, duration: number, estimatedTimes: Date[]) => void;
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
  const mapRef = useRef<google.maps.Map>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [center] = useState<Location>({ 
    lat: settings?.operational_base_latitude || -23.5505, 
    lng: settings?.operational_base_longitude || -46.6333 
  });

  // Add debug logs
  useEffect(() => {
    console.log("Settings received:", settings);
    console.log("Google Maps API Key:", settings?.google_maps_key);
    console.log("Window google object:", window.google);
  }, [settings]);

  useEffect(() => {
    if (!window.google || !settings || selectedStops.length === 0) {
      console.log("Missing requirements:", {
        google: !window.google,
        settings: !settings,
        noStops: selectedStops.length === 0
      });
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const startLocation = getLocationFromType(startLocationType, settings, selectedStartService);
    const endLocation = getLocationFromType(endLocationType, settings, selectedEndService);

    if (!startLocation || !endLocation) {
      console.log("Missing locations:", { startLocation, endLocation });
      return;
    }

    const calculateRoute = async () => {
      try {
        const result = await optimizeRoute(
          directionsService,
          startLocation,
          endLocation,
          selectedStops,
          settings.service_default_duration
        );
        
        setDirections(result.directions);
        if (onRouteStats) {
          onRouteStats(result.totalDistance, result.totalDuration, result.estimatedTimes);
        }
        if (onOptimizedStops) {
          onOptimizedStops(result.optimizedWaypoints);
        }
      } catch (error) {
        console.error("Error calculating route:", error);
      }
    };

    calculateRoute();
  }, [selectedStops, settings, startLocationType, endLocationType, selectedStartService, selectedEndService, onRouteStats, onOptimizedStops]);

  const mapOptions: google.maps.MapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "cooperative",
    disableDefaultUI: false,
    clickableIcons: false,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP
    }
  };

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