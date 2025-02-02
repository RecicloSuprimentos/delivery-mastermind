import { useState, useEffect, useRef } from "react";
import { useDirectionsCache } from "@/hooks/useDirectionsCache";
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
  const directionsService = useRef<google.maps.DirectionsService>();

  useEffect(() => {
    if (window.google) {
      directionsService.current = new google.maps.DirectionsService();
    }
  }, []);

  const { directions } = useDirectionsCache(
    directionsService.current!,
    settings,
    selectedStops,
    startLocationType,
    endLocationType,
    selectedStartService,
    selectedEndService,
    shouldOptimize
  );

  useEffect(() => {
    if (directions) {
      const legs = directions.routes[0].legs;
      const waypointOrder = directions.routes[0].waypoint_order;
      
      const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
      const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
      
      if (onRouteStats) {
        const estimatedTimes = legs.map((leg) => {
          const time = new Date();
          time.setSeconds(time.getSeconds() + leg.duration.value);
          return time;
        });
        
        onRouteStats(totalDistance, totalDuration, estimatedTimes);
      }
      
      if (shouldOptimize && onOptimizedStops) {
        const optimizedWaypoints = waypointOrder.map(index => selectedStops[index]);
        onOptimizedStops(optimizedWaypoints);
      }
    }
  }, [directions, onRouteStats, onOptimizedStops, shouldOptimize, selectedStops]);

  return directions;
};