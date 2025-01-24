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
    if (!window.google || !settings) {
      console.log("Google Maps ou configurações não disponíveis");
      return;
    }

    // Verifica se há paradas selecionadas
    if (selectedStops.length === 0) {
      console.log("Nenhuma parada selecionada");
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const startLocation = getLocationFromType(startLocationType, settings, selectedStartService);
    const endLocation = getLocationFromType(endLocationType, settings, selectedEndService);

    if (!startLocation || !endLocation) {
      console.log("Localizações de origem ou destino inválidas:", { startLocation, endLocation });
      return;
    }

    const calculateRoute = async () => {
      try {
        console.log("Calculando rota com:", {
          startLocation,
          endLocation,
          stops: selectedStops,
          duration: settings.service_default_duration
        });

        const result = await optimizeRoute(
          directionsService,
          startLocation,
          endLocation,
          selectedStops,
          settings.service_default_duration
        );
        
        console.log("Rota calculada com sucesso:", result);
        
        setDirections(result.directions);
        if (onRouteStats) {
          onRouteStats(result.totalDistance, result.totalDuration, result.estimatedTimes);
        }
        if (onOptimizedStops && shouldOptimize) {
          onOptimizedStops(result.optimizedWaypoints);
        }
      } catch (error) {
        console.error("Erro ao calcular rota:", error);
      }
    };

    calculateRoute();
  }, [selectedStops, settings, startLocationType, endLocationType, selectedStartService, selectedEndService, shouldOptimize]);

  return directions;
};