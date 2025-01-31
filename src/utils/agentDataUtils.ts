import { parseISO, format } from "date-fns";
import type { TimelineStop } from "@/types/monitoring";

export const isServiceCompleted = (status?: string) => 
  ["completed", "cancelled"].includes(status || "");

export const calculateCompletedServices = (stops: any[]) => {
  const collectionsStops = stops.filter(
    (stop) => stop.service?.type === "coleta"
  );
  const deliveriesStops = stops.filter(
    (stop) => stop.service?.type === "entrega"
  );

  const completedCollections = collectionsStops.filter(
    (stop) => isServiceCompleted(stop.service?.status)
  ).length;
  const completedDeliveries = deliveriesStops.filter(
    (stop) => isServiceCompleted(stop.service?.status)
  ).length;

  return {
    completedCollections,
    completedDeliveries,
    totalCompleted: completedCollections + completedDeliveries,
    collections: collectionsStops.length,
    deliveries: deliveriesStops.length,
  };
};

export const calculateOnTimePerformance = (stops: any[]) => {
  let onTimeServices = 0;
  stops.forEach((stop) => {
    if (isServiceCompleted(stop.service?.status) && stop.estimated_arrival_time) {
      const estimatedTime = parseISO(stop.estimated_arrival_time);
      const actualTime = stop.estimated_departure_time 
        ? parseISO(stop.estimated_departure_time)
        : null;
      
      if (actualTime && actualTime <= estimatedTime) {
        onTimeServices++;
      }
    }
  });

  return stops.length > 0 ? (onTimeServices / stops.length) * 100 : 0;
};

export const buildTimeline = (stops: any[], completedServices: number): TimelineStop[] => {
  let completionCounter = 0;
  
  return stops.map((stop, index) => {
    const isCompleted = isServiceCompleted(stop.service?.status);
    if (isCompleted) {
      completionCounter++;
    }

    return {
      id: stop.id,
      serviceNumber: index + 1,
      status: isCompleted
        ? (stop.service?.status as "completed" | "cancelled")
        : index === completedServices
        ? "current"
        : "pending",
      estimatedTime: stop.estimated_arrival_time 
        ? format(parseISO(stop.estimated_arrival_time), "HH:mm")
        : "",
      actualTime: isCompleted && stop.estimated_departure_time
        ? format(parseISO(stop.estimated_departure_time), "HH:mm")
        : undefined,
      completionOrder: isCompleted ? completionCounter : undefined,
    };
  });
};