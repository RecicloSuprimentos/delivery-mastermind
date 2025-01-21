import { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Location, Service, SystemSettings } from "@/types/routes";
import { MapContainer } from "./MapContainer";
import { calculateRoute, getLocationFromService, getBaseLocation } from "./RouteCalculator";

interface RouteMapProps {
  settings: SystemSettings;
  selectedStops: Service[];
  startLocationType: "operational_base" | "service";
  endLocationType: "operational_base" | "service";
  selectedStartService: Service | null;
  selectedEndService: Service | null;
  onRouteStats: (distance: number, duration: number) => void;
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
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [markers, setMarkers] = useState<{ position: Location; label?: string }[]>([]);
  const baseLocation = getBaseLocation(settings);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: settings.google_maps_key || "",
    libraries: ["places"],
  });

  useEffect(() => {
    if (!isLoaded) return;

    const updateRoute = async () => {
      try {
        const directionsService = new google.maps.DirectionsService();
        
        const origin = startLocationType === "operational_base" 
          ? baseLocation 
          : selectedStartService 
            ? getLocationFromService(selectedStartService)
            : baseLocation;

        const destination = endLocationType === "operational_base"
          ? baseLocation
          : selectedEndService
            ? getLocationFromService(selectedEndService)
            : baseLocation;

        const waypoints = selectedStops
          .filter(stop => stop.latitude && stop.longitude)
          .map(stop => getLocationFromService(stop));

        if (waypoints.length > 0 || origin !== destination) {
          const result = await calculateRoute(
            directionsService,
            origin,
            destination,
            waypoints
          );

          setDirections(result);

          const totalDistance = result.routes[0].legs.reduce(
            (acc, leg) => acc + (leg.distance?.value || 0),
            0
          );

          const totalDuration = result.routes[0].legs.reduce(
            (acc, leg) => acc + (leg.duration?.value || 0),
            0
          );

          onRouteStats(totalDistance, Math.round(totalDuration / 60));
        }
      } catch (error) {
        console.error("Error calculating route:", error);
      }
    };

    updateRoute();
  }, [isLoaded, selectedStops, startLocationType, endLocationType, selectedStartService, selectedEndService]);

  useEffect(() => {
    const newMarkers = [];
    
    if (startLocationType === "operational_base") {
      newMarkers.push({ position: baseLocation, label: "I" });
    } else if (selectedStartService) {
      newMarkers.push({ 
        position: getLocationFromService(selectedStartService),
        label: "I"
      });
    }

    selectedStops.forEach((stop, index) => {
      if (stop.latitude && stop.longitude) {
        newMarkers.push({
          position: getLocationFromService(stop),
          label: String(index + 1)
        });
      }
    });

    if (endLocationType === "operational_base") {
      newMarkers.push({ position: baseLocation, label: "F" });
    } else if (selectedEndService) {
      newMarkers.push({ 
        position: getLocationFromService(selectedEndService),
        label: "F"
      });
    }

    setMarkers(newMarkers);
  }, [selectedStops, startLocationType, endLocationType, selectedStartService, selectedEndService]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={baseLocation}
        markers={markers}
        directions={directions}
      />
    </div>
  );
};