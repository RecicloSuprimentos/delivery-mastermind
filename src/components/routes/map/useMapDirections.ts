import { useState, useEffect, useRef } from "react";
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
  
  // Referência para armazenar o último estado calculado
  const lastCalculation = useRef<{
    stopsIds: string[];
    startType: string;
    endType: string;
    startId?: string;
    endId?: string;
  }>();

  // Função para verificar se houve mudança real nos pontos
  const hasRouteChanged = () => {
    const currentStopsIds = selectedStops.map(stop => stop.id);
    const currentStartId = selectedStartService?.id;
    const currentEndId = selectedEndService?.id;

    // Se não há cálculo anterior, precisamos calcular
    if (!lastCalculation.current) {
      lastCalculation.current = {
        stopsIds: currentStopsIds,
        startType: startLocationType,
        endType: endLocationType,
        startId: currentStartId,
        endId: currentEndId,
      };
      return true;
    }

    // Verifica se houve mudança real
    const hasChanged = 
      lastCalculation.current.startType !== startLocationType ||
      lastCalculation.current.endType !== endLocationType ||
      lastCalculation.current.startId !== currentStartId ||
      lastCalculation.current.endId !== currentEndId ||
      lastCalculation.current.stopsIds.length !== currentStopsIds.length ||
      !lastCalculation.current.stopsIds.every((id, index) => id === currentStopsIds[index]);

    // Atualiza a referência se houve mudança
    if (hasChanged) {
      lastCalculation.current = {
        stopsIds: currentStopsIds,
        startType: startLocationType,
        endType: endLocationType,
        startId: currentStartId,
        endId: currentEndId,
      };
    }

    return hasChanged;
  };

  useEffect(() => {
    // Não calcula se não tiver o Google Maps ou configurações
    if (!window.google || !settings) {
      console.log("Google Maps ou configurações não disponíveis");
      return;
    }

    // Não calcula se não houver pontos
    if (selectedStops.length === 0) {
      setDirections(null);
      return;
    }

    // Verifica se precisa realmente recalcular
    // Agora recalcula se:
    // 1. É a primeira vez (não tem directions)
    // 2. Houve mudança nos pontos
    // 3. O usuário clicou em otimizar (shouldOptimize é true)
    if (!directions || hasRouteChanged() || shouldOptimize) {
      console.log("Calculando nova rota...", { isFirstTime: !directions, shouldOptimize });
      const directionsService = new google.maps.DirectionsService();

      const fetchDirections = async () => {
        const result = await calculateRoute(
          directionsService,
          settings,
          selectedStops,
          startLocationType,
          endLocationType,
          selectedStartService,
          selectedEndService,
          shouldOptimize // Passa o flag de otimização para o cálculo da rota
        );

        if (result) {
          setDirections(result);
          
          const legs = result.routes[0].legs;
          const waypointOrder = result.routes[0].waypoint_order;
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
          
          // Apenas atualiza a ordem dos pontos se estiver otimizando
          if (shouldOptimize && onOptimizedStops) {
            const optimizedWaypoints = waypointOrder.map(index => selectedStops[index]);
            onOptimizedStops(optimizedWaypoints);
          }
        }
      };

      fetchDirections();
    }
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