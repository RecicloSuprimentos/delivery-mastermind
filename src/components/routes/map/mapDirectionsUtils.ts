import type { Service, SystemSettings } from "@/types/routes";
import { getLocationFromType } from "@/utils/mapUtils";

export const calculateRoute = async (
  directionsService: google.maps.DirectionsService,
  settings: SystemSettings,
  selectedStops: Service[],
  startLocationType: string,
  endLocationType: string,
  selectedStartService?: Service,
  selectedEndService?: Service,
  shouldOptimize: boolean = false,
  isInverted: boolean = false
) => {
  const startLocation = getLocationFromType(startLocationType, settings, selectedStartService);
  const endLocation = getLocationFromType(endLocationType, settings, selectedEndService);

  if (!startLocation || !endLocation) {
    console.log("Localizações de origem ou destino inválidas:", { startLocation, endLocation });
    return null;
  }

  const waypoints = selectedStops.map(stop => ({
    location: { lat: stop.latitude, lng: stop.longitude },
    stopover: true,
  }));

  try {
    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin: startLocation,
          destination: endLocation,
          waypoints,
          optimizeWaypoints: shouldOptimize && !isInverted, // Não otimiza se estiver invertido
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Failed to calculate route: ${status}`));
          }
        }
      );
    });

    return result;
  } catch (error) {
    console.error("Erro ao calcular rota:", error);
    return null;
  }
};