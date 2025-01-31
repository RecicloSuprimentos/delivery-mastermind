export interface AgentLocation {
  latitude: number;
  longitude: number;
}

export interface TimelineStop {
  id: string;
  serviceNumber: number;
  status: "completed" | "cancelled" | "current" | "pending";
  estimatedTime: string;
  actualTime?: string;
  completionOrder?: number;
}

export interface AgentData {
  id: string;
  name: string;
  status: "online" | "offline" | "in-transit" | "arrived";
  completedServices: number;
  totalServices: number;
  collections: number;
  deliveries: number;
  pendingServices: number;
  onTimePerformance: number;
  currentLocation?: AgentLocation;
  timeline: TimelineStop[];
}