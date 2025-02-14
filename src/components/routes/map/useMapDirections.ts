
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
  isInverted?: boolean;
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
  isInverted = false,
}: UseMapDirectionsProps) => {
  const directionsService = useRef<google.maps.DirectionsService>();

  useEffect(() => {
    if (window.google) {
      directionsService.current = new google.maps.DirectionsService();
    }
  }, []);

  // Separa os serviços completados dos pendentes
  const completedStops = selectedStops.filter(stop => stop.status === "completed");
  const pendingStops = selectedStops.filter(stop => stop.status !== "completed");
  const lastCompletedStop = completedStops[completedStops.length - 1];

  // Se houver serviços completados, usa o último como ponto de partida para otimização
  const effectiveStartLocationType = lastCompletedStop ? "service" : startLocationType;
  const effectiveStartService = lastCompletedStop || selectedStartService;

  const { directions } = useDirectionsCache(
    directionsService.current!,
    settings,
    pendingStops, // Usa apenas os serviços pendentes para otimização
    effectiveStartLocationType,
    endLocationType,
    effectiveStartService,
    selectedEndService,
    shouldOptimize,
    isInverted
  );

  useEffect(() => {
    const directionsResult = directions as google.maps.DirectionsResult | null;
    
    if (directionsResult?.routes && directionsResult.routes.length > 0) {
      const legs = directionsResult.routes[0].legs;
      const waypointOrder = directionsResult.routes[0].waypoint_order;
      
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
      
      // Atualiza a ordem das paradas mantendo os serviços completados no início
      if (shouldOptimize && !isInverted && onOptimizedStops) {
        const optimizedPendingStops = waypointOrder.map(index => pendingStops[index]);
        const allOptimizedStops = [...completedStops, ...optimizedPendingStops];
        onOptimizedStops(allOptimizedStops);
      }
    }
  }, [directions, onRouteStats, onOptimizedStops, shouldOptimize, completedStops, pendingStops, isInverted]);

  return directions as google.maps.DirectionsResult | null;
};
