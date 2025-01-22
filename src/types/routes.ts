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
}

export interface SystemSettings {
  id: string;
  operational_base_address: string;
  operational_base_latitude: number;
  operational_base_longitude: number;
  service_default_duration: number;
}

export interface RouteStats {
  distance: number;
  duration: number;
  estimatedTimes: Date[];
}