import { Location, Service, SystemSettings } from "@/types/routes";

export const calculateRoute = async (
  directionsService: google.maps.DirectionsService,
  origin: Location,
  destination: Location,
  waypoints: Location[]
): Promise<google.maps.DirectionsResult> => {
  const response = await directionsService.route({
    origin,
    destination,
    waypoints: waypoints.map(location => ({
      location,
      stopover: true
    })),
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING,
  });

  return response;
};

export const getLocationFromService = (service: Service): Location => ({
  lat: Number(service.latitude),
  lng: Number(service.longitude),
});

export const getBaseLocation = (settings: SystemSettings): Location => ({
  lat: Number(settings.operational_base_latitude),
  lng: Number(settings.operational_base_longitude),
});