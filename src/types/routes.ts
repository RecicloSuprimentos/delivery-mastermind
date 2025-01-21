export interface Location {
  lat: number;
  lng: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  user_type: "agent";
  is_active?: boolean;
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
  status?: string;
}

export interface RouteStop {
  service_id: string;
  sequence_number: number;
  estimated_arrival_time?: string;
  estimated_departure_time?: string;
  distance_from_previous?: number;
  duration_from_previous?: number;
  service: Service;
}

export interface Route {
  id: string;
  name: string;
  agent_id: string;
  start_time: string;
  start_location_type: "operational_base" | "service";
  start_location_reference: string;
  end_location_type: "operational_base" | "service";
  end_location_reference: string;
  total_distance?: number;
  total_duration?: number;
  status?: string;
  agent?: {
    name: string;
  };
  route_stops: RouteStop[];
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