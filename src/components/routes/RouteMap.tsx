import { useCallback, useEffect, useState } from "react";
import { MapContainer } from "./map/MapContainer";
import { RouteDirections } from "./map/RouteDirections";
import { StopMarkers } from "./map/StopMarkers";
import { RouteStats } from "./RouteStats";
import { calculateTimeWindowViolation } from "@/utils/mapUtils";

interface Service {
  id: string;
  latitude?: number;
  longitude?: number;
  time_window?: string;
}

interface RouteMapProps {
  services: Service[];
  startLocation?: google.maps.LatLngLiteral;
  endLocation?: google.maps.LatLngLiteral;
  onRouteCalculated?: (data: {
    distance: number;
    duration: number;
    estimatedTimes: Date[];
  }) => void;
}

export const RouteMap = ({
  services,
  startLocation,
  endLocation,
  onRouteCalculated,
}: RouteMapProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral | undefined>(startLocation);

  const calculateRoute = useCallback(async () => {
    if (!directionsService || !startLocation || !endLocation || services.length === 0) return;

    const waypoints = services.map(service => ({
      location: { lat: service.latitude!, lng: service.longitude! },
      stopover: true,
    }));

    try {
      const result = await directionsService.route({
        origin: startLocation,
        destination: endLocation,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);

      if (onRouteCalculated) {
        const legs = result.routes[0].legs;
        const totalDistance = legs.reduce((acc, leg) => acc + leg.distance!.value, 0);
        const totalDuration = legs.reduce((acc, leg) => acc + leg.duration!.value, 0);

        const startTime = new Date();
        const estimatedTimes: Date[] = [];
        let currentTime = new Date(startTime);

        legs.forEach((leg) => {
          currentTime = new Date(currentTime.getTime() + leg.duration!.value * 1000);
          estimatedTimes.push(new Date(currentTime));
          currentTime = new Date(currentTime.getTime() + 10 * 60 * 1000); // 10 min service time
        });

        onRouteCalculated({
          distance: totalDistance,
          duration: totalDuration,
          estimatedTimes,
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  }, [directionsService, startLocation, endLocation, services, onRouteCalculated]);

  useEffect(() => {
    if (window.google) {
      setDirectionsService(new google.maps.DirectionsService());
    }
  }, []);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const stops = [
    { location: startLocation!, label: "I" },
    ...services.map((service, index) => ({
      location: { lat: service.latitude!, lng: service.longitude! },
      label: (index + 1).toString(),
    })),
    { location: endLocation!, label: "F" },
  ].filter(stop => stop.location);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        onLoad={(map) => {
          if (startLocation) {
            setCenter(startLocation);
            map.setCenter(startLocation);
          }
        }}
      >
        <RouteDirections directions={directions} />
        <StopMarkers stops={stops} />
      </MapContainer>
      <RouteStats
        distance={directions?.routes[0].legs.reduce((acc, leg) => acc + leg.distance!.value, 0)}
        duration={directions?.routes[0].legs.reduce((acc, leg) => acc + leg.duration!.value, 0)}
        estimatedTimes={directions?.routes[0].legs.map(leg => {
          const time = new Date();
          time.setSeconds(time.getSeconds() + leg.duration!.value);
          return time;
        })}
        stops={services}
      />
    </div>
  );
};