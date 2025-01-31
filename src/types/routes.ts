export interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  status?: string;
  address: string;
  latitude: number;
  longitude: number;
  time_window?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  agent_id?: string;
  agent?: {
    name: string;
  };
  start_time: string;
  start_location_type: "operational_base" | "service";
  start_location_reference: string;
  end_location_type: "operational_base" | "service";
  end_location_reference: string;
  total_distance?: number;
  total_duration?: number;
  status?: string;
  route_stops?: Array<{
    service: Service;
  }>;
}

export interface ServiceFailureReason {
  id: string;
  reason: string;
  is_other: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SystemSettings {
  id: string;
  operational_base_address?: string;
  operational_base_latitude?: number;
  operational_base_longitude?: number;
  google_maps_key?: string;
}