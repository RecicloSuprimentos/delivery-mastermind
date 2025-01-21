export interface Agent {
  id: string;
  name: string;
  email: string;
  user_type: "agent";
}

export interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  time_window?: string;
  phone: string;
  email?: string;
  complement?: string;
  observations?: string;
}

export interface RouteStop {
  service_id: string;
  sequence_number: number;
  estimated_arrival_time?: string;
  service: Service;
}

export interface SystemSettings {
  id: string;
  operational_base_address: string;
  operational_base_latitude: number;
  operational_base_longitude: number;
  service_default_duration: number;
}

export interface RouteMapProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: "operational_base" | "service";
  endLocationType: "operational_base" | "service";
  selectedStartService?: Service;
  selectedEndService?: Service;
  onRouteStats: (distance: number, duration: number) => void;
}