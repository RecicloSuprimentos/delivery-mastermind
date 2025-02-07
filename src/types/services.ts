
export type ValidStatus = "not-assigned" | "assigned" | "accepted" | "in-transit" | "arrived" | "completed" | "cancelled";

export interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  phone: string;
  email?: string;
  complement?: string;
  time_window?: string;
  observations?: string;
  status: ValidStatus;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}
