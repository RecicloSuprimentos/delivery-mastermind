import type { Service, SystemSettings } from "@/types/routes";
import type { DirectionsKey } from "@/types/directions";

export const calculateDirectionsKey = (
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