import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import type { Service, SystemSettings } from "@/types/routes";
import { calculateRoute } from "@/components/routes/map/mapDirectionsUtils";

interface DirectionsKey {
  startLocation: google.maps.LatLngLiteral;
  endLocation: google.maps.LatLngLiteral;
  waypoints: google.maps.LatLngLiteral[];
  optimize: boolean;
}

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
      queryFn: () => calculateRoute(directionsService, settings!, selectedStops, startLocationType, endLocationType, selectedStartService, selectedEndService, shouldOptimize),
    });
  }, 1000);

  const { data: directions, isLoading } = useQuery({
    queryKey: ["directions", cacheKey],
    queryFn: () => {
      if (!cacheKey) return null;
      return calculateRoute(directionsService, settings!, selectedStops, startLocationType, endLocationType, selectedStartService, selectedEndService, shouldOptimize);
    },
    enabled: !!cacheKey,
    staleTime: 5 * 60 * 1000, // Cache válido por 5 minutos
    gcTime: 30 * 60 * 1000, // Mantém no cache por 30 minutos (anteriormente cacheTime)
  });

  return {
    directions,
    isLoading,
    prefetchNextRoute: (nextKey: string) => debouncedPrefetch(nextKey),
  };
};