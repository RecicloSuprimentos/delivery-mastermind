import type { Location, Service } from "@/types/routes";

export const calculateTimeWindowViolation = (
  arrivalTime: Date,
  timeWindow?: string
): number => {
  if (!timeWindow) return 0;

  const [start, end] = timeWindow.split("-").map(t => {
    const [hours, minutes] = t.trim().split(":").map(Number);
    const date = new Date(arrivalTime);
    date.setHours(hours, minutes, 0, 0);
    return date;
  });

  if (arrivalTime < start) {
    return Math.floor((start.getTime() - arrivalTime.getTime()) / (1000 * 60));
  }
  if (arrivalTime > end) {
    return Math.floor((arrivalTime.getTime() - end.getTime()) / (1000 * 60));
  }
  return 0;
};

export const getLocationFromType = (
  locationType: string,
  settings: any,
  service?: Service
): Location | null => {
  if (locationType === "operational_base" && settings) {
    return {
      lat: settings.operational_base_latitude,
      lng: settings.operational_base_longitude,
    };
  } else if (locationType === "service" && service) {
    return {
      lat: service.latitude,
      lng: service.longitude,
    };
  }
  return null;
};

export const createOptimizedRoute = async (
  directionsService: google.maps.DirectionsService,
  startLocation: Location,
  endLocation: Location,
  waypoints: google.maps.DirectionsWaypoint[],
  defaultDuration: number
): Promise<{
  directions: google.maps.DirectionsResult;
  totalDistance: number;
  totalDuration: number;
  estimatedTimes: Date[];
}> => {
  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin: startLocation,
        destination: endLocation,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const legs = result.routes[0].legs;
          const totalServiceDuration = (waypoints.length + 2) * defaultDuration * 60;
          const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
          const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0) + totalServiceDuration;

          // Calculate estimated arrival times
          const startTime = new Date();
          const estimatedTimes: Date[] = [];
          let currentTime = new Date(startTime);

          legs.forEach((leg, index) => {
            // Add travel time
            currentTime = new Date(currentTime.getTime() + leg.duration.value * 1000);
            // Add service duration
            estimatedTimes.push(new Date(currentTime));
            currentTime = new Date(currentTime.getTime() + defaultDuration * 60 * 1000);
          });

          resolve({
            directions: result,
            totalDistance,
            totalDuration: Math.round(totalDuration / 60),
            estimatedTimes,
          });
        } else {
          reject(new Error(`Failed to calculate route: ${status}`));
        }
      }
    );
  });
};