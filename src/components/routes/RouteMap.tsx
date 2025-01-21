import { useCallback, useEffect, useState } from "react";
import { MapContainer } from "./map/MapContainer";
import { RouteDirections } from "./map/RouteDirections";
import { StopMarkers } from "./map/StopMarkers";
import { RouteStats } from "./RouteStats";
import type { RouteMapProps } from "@/types/routes";

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
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral | undefined>(
    settings ? { 
      lat: settings.operational_base_latitude, 
      lng: settings.operational_base_longitude 
    } : undefined
  );

  const calculateRoute = useCallback(async () => {
    if (!directionsService || !selectedStartService || !selectedEndService || selectedStops.length === 0) return;

    const waypoints = selectedStops.map(service => ({
      location: { lat: service.latitude!, lng: service.longitude! },
      stopover: true,
    }));

    try {
      const result = await directionsService.route({
        origin: startLocationType === "operational_base" && settings ? {
          lat: settings.operational_base_latitude,
          lng: settings.operational_base_longitude,
        } : {
          lat: selectedStartService.latitude,
          lng: selectedStartService.longitude,
        },
        destination: endLocationType === "operational_base" && settings ? {
          lat: settings.operational_base_latitude,
          lng: settings.operational_base_longitude,
        } : {
          lat: selectedEndService.latitude,
          lng: selectedEndService.longitude,
        },
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);

      if (onRouteStats) {
        const legs = result.routes[0].legs;
        const totalDistance = legs.reduce((acc, leg) => acc + leg.distance!.value, 0);
        const totalDuration = legs.reduce((acc, leg) => acc + leg.duration!.value, 0);
        onRouteStats(totalDistance, totalDuration);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  }, [directionsService, selectedStartService, selectedEndService, selectedStops, onRouteStats, settings, startLocationType, endLocationType]);

  useEffect(() => {
    if (window.google) {
      setDirectionsService(new google.maps.DirectionsService());
    }
  }, []);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const stops = [
    startLocationType === "operational_base" && settings ? {
      location: { 
        lat: settings.operational_base_latitude, 
        lng: settings.operational_base_longitude 
      },
      label: "I"
    } : selectedStartService ? {
      location: { 
        lat: selectedStartService.latitude, 
        lng: selectedStartService.longitude 
      },
      label: "I"
    } : null,
    ...selectedStops.map((service, index) => ({
      location: { lat: service.latitude, lng: service.longitude },
      label: (index + 1).toString(),
    })),
    endLocationType === "operational_base" && settings ? {
      location: { 
        lat: settings.operational_base_latitude, 
        lng: settings.operational_base_longitude 
      },
      label: "F"
    } : selectedEndService ? {
      location: { 
        lat: selectedEndService.latitude, 
        lng: selectedEndService.longitude 
      },
      label: "F"
    } : null,
  ].filter((stop): stop is NonNullable<typeof stop> => stop !== null);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        onLoad={(map) => {
          if (center) {
            map.setCenter(center);
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
        stops={selectedStops}
      />
    </div>
  );
};