export interface CustomerData {
  name?: string;
  phone_number?: string;
  email?: string;
  address_complement?: string;
}

export interface ServiceData {
  type?: 'pickup' | 'delivery' | string;
  code?: string;
  service_id?: string;
  customer?: CustomerData;
  customer_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  complement?: string;
  time_window?: string;
  duration_prevision_time?: string;
  note?: string;
  observations?: string;
  latitude?: number;
  longitude?: number;
}

export interface ProcessedService {
  type: 'coleta' | 'entrega';
  service_id: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  complement?: string;
  time_window?: string;
  observations?: string;
  latitude?: number;
  longitude?: number;
}