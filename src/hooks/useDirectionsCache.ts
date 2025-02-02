import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import type { Service, SystemSettings } from "@/types/routes";
import { calculateRoute } from "@/components/routes/map/mapDirectionsUtils";

// Interface para monitoramento
interface DirectionsMetrics {
  timestamp: number;
  cacheHit: boolean;
  requestDuration: number;
  waypoints: number;
  optimized: boolean;
}

// Cache de métricas em memória
const metricsCache: DirectionsMetrics[] = [];

interface DirectionsKey {
  startLocation: google.maps.LatLngLiteral;
  endLocation: google.maps.LatLngLiteral;
  waypoints: google.maps.LatLngLiteral[];
  optimize: boolean;
}

const logDirectionsMetrics = (metrics: DirectionsMetrics) => {
  metricsCache.push(metrics);
  // Limitar o tamanho do cache de métricas
  if (metricsCache.length > 1000) {
    metricsCache.shift();
  }
  
  console.log("[Directions API Metrics]", {
    timestamp: new Date(metrics.timestamp).toISOString(),
    cacheHit: metrics.cacheHit,
    requestDuration: `${metrics.requestDuration}ms`,
    waypoints: metrics.waypoints,
    optimized: metrics.optimized,
  });
};

const calculateDirectionsKey = (
  settings: SystemSettings | undefined,
  selectedStops: Service[],
  startLocationType: string,
  endLocationType: string,
  selectedStartService?: Service,
  selectedEndService?: Service,
  shouldOptimize: boolean = false
): string => {
  const startLocation = startLocationType === "operational_base" && settings
    ? { lat: settings.operational_base_latitude, lng: settings.operational_base_longitude }
    : selectedStartService
    ? { lat: selectedStartService.latitude, lng: selectedStartService.longitude }
    : null;

  const endLocation = endLocationType === "operational_base" && settings
    ? { lat: settings.operational_base_latitude, lng: settings.operational_base_longitude }
    : selectedEndService
    ? { lat: selectedEndService.latitude, lng: selectedEndService.longitude }
    : null;

  const waypoints = selectedStops.map(stop => ({
    lat: stop.latitude,
    lng: stop.longitude,
  }));

  if (!startLocation || !endLocation) return "";

  return JSON.stringify({
    startLocation,
    endLocation,
    waypoints,
    optimize: shouldOptimize,
  });
};

export const useDirectionsCache = (
  directionsService: google.maps.DirectionsService,
  settings: SystemSettings | undefined,
  selectedStops: Service[],
  startLocationType: string,
  endLocationType: string,
  selectedStartService?: Service,
  selectedEndService?: Service,
  shouldOptimize: boolean = false
) => {
  const queryClient = useQueryClient();
  const cacheKey = calculateDirectionsKey(
    settings,
    selectedStops,
    startLocationType,
    endLocationType,
    selectedStartService,
    selectedEndService,
    shouldOptimize
  );

  const debouncedPrefetch = debounce((key: string) => {
    const parsedKey: DirectionsKey = JSON.parse(key);
    queryClient.prefetchQuery({
      queryKey: ["directions", key],
      queryFn: async () => {
        const startTime = performance.now();
        const result = await calculateRoute(
          directionsService,
          settings!,
          selectedStops,
          startLocationType,
          endLocationType,
          selectedStartService,
          selectedEndService,
          shouldOptimize
        );
        const endTime = performance.now();

        logDirectionsMetrics({
          timestamp: Date.now(),
          cacheHit: false,
          requestDuration: endTime - startTime,
          waypoints: parsedKey.waypoints.length,
          optimized: parsedKey.optimize,
        });

        return result;
      },
    });
  }, 1000);

  const { data: directions, isLoading } = useQuery({
    queryKey: ["directions", cacheKey],
    queryFn: async () => {
      if (!cacheKey) return null;
      
      const startTime = performance.now();
      const cachedData = queryClient.getQueryData(["directions", cacheKey]);
      
      if (cachedData) {
        logDirectionsMetrics({
          timestamp: Date.now(),
          cacheHit: true,
          requestDuration: 0,
          waypoints: selectedStops.length,
          optimized: shouldOptimize,
        });
        return cachedData;
      }

      const result = await calculateRoute(
        directionsService,
        settings!,
        selectedStops,
        startLocationType,
        endLocationType,
        selectedStartService,
        selectedEndService,
        shouldOptimize
      );
      
      const endTime = performance.now();

      logDirectionsMetrics({
        timestamp: Date.now(),
        cacheHit: false,
        requestDuration: endTime - startTime,
        waypoints: selectedStops.length,
        optimized: shouldOptimize,
      });

      return result;
    },
    enabled: !!cacheKey,
    staleTime: 30 * 60 * 1000, // Cache válido por 30 minutos
    gcTime: 60 * 60 * 1000, // Mantém no cache por 1 hora
  });

  return {
    directions,
    isLoading,
    prefetchNextRoute: (nextKey: string) => debouncedPrefetch(nextKey),
    getMetrics: () => [...metricsCache], // Expõe as métricas para análise
  };
};