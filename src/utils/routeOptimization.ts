import type { Location, Service, SystemSettings } from "@/types/routes";

export const optimizeRoute = async (
  directionsService: google.maps.DirectionsService,
  startLocation: Location,
  endLocation: Location,
  waypoints: Service[],
  defaultDuration: number
): Promise<{
  directions: google.maps.DirectionsResult;
  totalDistance: number;
  totalDuration: number;
  estimatedTimes: Date[];
}> => {
  const formattedWaypoints = waypoints.map(stop => ({
    location: { lat: stop.latitude, lng: stop.longitude },
    stopover: true,
  }));

  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin: startLocation,
        destination: endLocation,
        waypoints: formattedWaypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const legs = result.routes[0].legs;
          const totalServiceDuration = (waypoints.length + 2) * defaultDuration * 60;
          const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
          const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0) + totalServiceDuration;

          // Calculate estimated arrival times considering service duration
          const startTime = new Date();
          const estimatedTimes: Date[] = [];
          let currentTime = new Date(startTime);

          legs.forEach((leg, index) => {
            // Add travel time
            currentTime = new Date(currentTime.getTime() + leg.duration.value * 1000);
            
            // Add service duration for the current stop
            if (waypoints[index]?.time_window) {
              const [startWindow] = waypoints[index].time_window.split('-')[0].trim().split(':').map(Number);
              const preferredTime = new Date(currentTime);
              preferredTime.setHours(startWindow, 0, 0, 0);
              
              // If we arrive before the preferred time, wait
              if (currentTime < preferredTime) {
                currentTime = new Date(preferredTime);
              }
            }
            
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