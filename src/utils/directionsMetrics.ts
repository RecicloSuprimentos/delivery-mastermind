import type { DirectionsMetrics } from "@/types/directions";

// Cache de métricas em memória
const metricsCache: DirectionsMetrics[] = [];

export const logDirectionsMetrics = (metrics: DirectionsMetrics) => {
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

export const getMetrics = () => [...metricsCache];