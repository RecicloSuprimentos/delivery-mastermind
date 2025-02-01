import type { Location, Service } from "@/types/routes";

interface OptimizationResult {
  directions: google.maps.DirectionsResult;
  totalDistance: number;
  totalDuration: number;
  estimatedTimes: Date[];
  optimizedWaypoints: Service[];
}

export const optimizeRoute = async (
  directionsService: google.maps.DirectionsService,
  startLocation: Location,
  endLocation: Location,
  waypoints: Service[],
  defaultDuration: number
): Promise<OptimizationResult> => {
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
          const waypointOrder = result.routes[0].waypoint_order;
          
          // Reorder waypoints based on optimization
          const optimizedWaypoints = waypointOrder.map(index => waypoints[index]);
          
          // Converter defaultDuration de minutos para segundos
          const serviceTimeInSeconds = defaultDuration * 60;
          // Calcular tempo total de serviço em segundos
          const totalServiceDuration = (waypoints.length + 2) * serviceTimeInSeconds;
          
          const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
          // Manter tudo em segundos
          const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0) + totalServiceDuration;

          // Calculate estimated arrival times considering service duration and time windows
          const startTime = new Date();
          const estimatedTimes: Date[] = [];
          let currentTime = new Date(startTime);

          optimizedWaypoints.forEach((waypoint, index) => {
            // Add travel time from previous stop
            currentTime = new Date(currentTime.getTime() + legs[index].duration.value * 1000);
            
            // If there's a time window, try to respect it
            if (waypoint.time_window) {
              const [startWindow] = waypoint.time_window.split('-')[0].trim().split(':').map(Number);
              const preferredTime = new Date(currentTime);
              preferredTime.setHours(startWindow, 0, 0, 0);
              
              // If we arrive before the preferred time, wait
              if (currentTime < preferredTime) {
                currentTime = new Date(preferredTime);
              }
            }
            
            // Store estimated arrival time
            estimatedTimes.push(new Date(currentTime));
            
            // Add service duration for this stop (em milissegundos)
            currentTime = new Date(currentTime.getTime() + serviceTimeInSeconds * 1000);
          });

          resolve({
            directions: result,
            totalDistance,
            totalDuration, // Mantendo em segundos
            estimatedTimes,
            optimizedWaypoints,
          });
        } else {
          reject(new Error(`Failed to calculate route: ${status}`));
        }
      }
    );
  });
};