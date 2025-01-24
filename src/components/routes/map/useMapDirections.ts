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
    // Verifica se temos todas as dependências necessárias
    if (!window.google || !settings) {
      console.log("Google Maps ou configurações não disponíveis");
      return;
    }

    // Verifica se há paradas selecionadas
    if (selectedStops.length === 0) {
      setDirections(null); // Limpa as direções se não houver paradas
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const startLocation = getLocationFromType(startLocationType, settings, selectedStartService);
    const endLocation = getLocationFromType(endLocationType, settings, selectedEndService);

    if (!startLocation || !endLocation) {
      console.log("Localizações de origem ou destino inválidas:", { startLocation, endLocation });
      return;
    }

    // Função para calcular a rota com debounce
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
        
        if (onOptimizedStops && shouldOptimize) {
          onOptimizedStops(result.optimizedWaypoints);
        }
      } catch (error) {
        console.error("Erro ao calcular rota:", error);
        setDirections(null);
      }
    };

    // Executa o cálculo da rota
    calculateRoute();
  }, [
    settings,
    selectedStops,
    startLocationType,
    endLocationType,
    selectedStartService,
    selectedEndService,
    shouldOptimize
  ]);

  return directions;
};