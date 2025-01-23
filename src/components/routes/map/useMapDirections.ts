import { useState, useEffect } from "react";
import { optimizeRoute } from "@/utils/routeOptimization";
import { getLocationFromType } from "@/utils/mapUtils";
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
    if (!window.google || !settings || selectedStops.length === 0 || !shouldOptimize) {
      console.log("Missing requirements or optimization not requested:", {
        google: !window.google,
        settings: !settings,
        noStops: selectedStops.length === 0,
        shouldOptimize
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
  }, [selectedStops, settings, startLocationType, endLocationType, selectedStartService, selectedEndService, onRouteStats, onOptimizedStops, shouldOptimize]);

  return directions;
};