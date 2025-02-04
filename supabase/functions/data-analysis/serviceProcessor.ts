import { ServiceData, ProcessedService } from './types.ts';

export function processPhoneNumber(phone: string): string {
  let formattedPhone = phone.trim();
  const dddMatch = formattedPhone.match(/(\d+)-(\d+)\((\d+)\)/);
  if (dddMatch) {
    formattedPhone = `(${dddMatch[3]})${dddMatch[1]}-${dddMatch[2]}`;
  }
  return formattedPhone;
}

export function processTimeWindow(service: ServiceData): string | null {
  if (service.duration_prevision_time) {
    return `${service.duration_prevision_time} minutos`;
  }
  
  if (service.time_window && /^\d{2}:\d{2} às \d{2}:\d{2}$/.test(service.time_window)) {
    return service.time_window;
  }
  
  return null;
}

export function processObservations(service: ServiceData): string {
  let observations = service.note || service.observations || '';
  if (service.time_window && !processTimeWindow(service)) {
    observations = observations ? `${observations}\n${service.time_window}` : service.time_window;
  }
  return observations;
}

export function processService(service: ServiceData): ProcessedService {
  const customerName = service.customer?.name || service.customer_name;
  const customerPhone = service.customer?.phone_number || service.phone;
  const addressComplement = service.customer?.address_complement || service.complement;
  
  if (!customerName) {
    throw new Error('Missing required field: customer name');
  }
  if (!customerPhone) {
    throw new Error('Missing required field: phone');
  }
  if (!service.address) {
    throw new Error('Missing required field: address');
  }

  return {
    type: service.type === 'pickup' ? 'coleta' : 
          service.type === 'delivery' ? 'entrega' : 
          service.type || 'coleta',
    service_id: service.code || 
                service.service_id || 
                `${Date.now()}`,
    customer_name: customerName.trim(),
    phone: processPhoneNumber(customerPhone),
    email: service.customer?.email || service.email,
    address: service.address,
    complement: addressComplement,
    time_window: processTimeWindow(service),
    observations: processObservations(service),
    latitude: service.latitude ? Number(service.latitude) : null,
    longitude: service.longitude ? Number(service.longitude) : null,
  };
}