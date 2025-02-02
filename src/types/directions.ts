export interface DirectionsMetrics {
  timestamp: number;
  cacheHit: boolean;
  requestDuration: number;
  waypoints: number;
  optimized: boolean;
}

export interface DirectionsKey {
  startLocation: google.maps.LatLngLiteral;
  endLocation: google.maps.LatLngLiteral;
  waypoints: google.maps.LatLngLiteral[];
  optimize: boolean;
}