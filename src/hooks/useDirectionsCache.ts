import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import type { Service, SystemSettings } from "@/types/routes";
import { calculateRoute } from "@/components/routes/map/mapDirectionsUtils";
import { logDirectionsMetrics, getMetrics } from "@/utils/directionsMetrics";
import { calculateDirectionsKey } from "@/utils/directionsCache";
import type { DirectionsKey } from "@/types/directions";

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
    staleTime: 48 * 60 * 60 * 1000, // Cache válido por 48 horas
    gcTime: 72 * 60 * 60 * 1000, // Mantém no cache por 72 horas
  });

  return {
    directions,
    isLoading,
    prefetchNextRoute: (nextKey: string) => debouncedPrefetch(nextKey),
    getMetrics,
  };
};