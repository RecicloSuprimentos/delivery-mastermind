export interface Location {
  lat: number;
  lng: number;
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

export interface SystemSettings {
  operational_base_address: string;
  operational_base_latitude: number;
  operational_base_longitude: number;
  service_default_duration: number;
  google_maps_key: string;
}

export interface RouteStats {
  distance: number;
  duration: number;
  estimatedTimes: Date[];
}