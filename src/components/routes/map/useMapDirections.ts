import { useState, useEffect } from "react";
import { calculateRoute } from "./mapDirectionsUtils";
import type { Service, SystemSettings } from "@/types/routes";

interface UseMapDirectionsProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: string;
  endLocationType: string;
  selectedStartService?: Service;
  selectedEndService?: Service;
  onRouteStats?: (distance: number, duration: number, estimatedTimes: Date[]) => void;
  onOptimizedStops?: (stops: Service[]) => void;
  shouldOptimize: boolean;
}

export const useMapDirections = ({
  settings,
  selectedStops,
  startLocationType,
  endLocationType,
  selectedStartService,
  selectedEndService,
  onRouteStats,
  onOptimizedStops,
  shouldOptimize,
}: UseMapDirectionsProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!shouldOptimize) {
      setDirections(null);
      return;
    }

    if (!window.google || !settings) {
      console.log("Google Maps ou configurações não disponíveis");
      return;
    }

    if (selectedStops.length === 0) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    const fetchDirections = async () => {
      const result = await calculateRoute(
        directionsService,
        settings,
        selectedStops,
        startLocationType,
        endLocationType,
        selectedStartService,
        selectedEndService
      );

      if (result) {
        setDirections(result);
        
        const legs = result.routes[0].legs;
        const waypointOrder = result.routes[0].waypoint_order;
        const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
        const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
        
        if (onRouteStats) {
          const estimatedTimes = legs.map((leg, index) => {
            const time = new Date();
            time.setSeconds(time.getSeconds() + leg.duration.value);
            return time;
          });
          
          onRouteStats(totalDistance, totalDuration, estimatedTimes);
        }
        
        if (onOptimizedStops) {
          const optimizedWaypoints = waypointOrder.map(index => selectedStops[index]);
          onOptimizedStops(optimizedWaypoints);
        }
      }
    };

    fetchDirections();
  }, [
    settings,
    selectedStops,
    startLocationType,
    endLocationType,
    selectedStartService,
    selectedEndService,
    shouldOptimize,
    onRouteStats,
    onOptimizedStops
  ]);

  return directions;
};