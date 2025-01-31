export interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  status?: string;
}

export interface SystemSettings {
  id: string;
  operational_base_address?: string;
  operational_base_latitude?: number;
  operational_base_longitude?: number;
  google_maps_key?: string;
}