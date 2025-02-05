import { ServiceData, ProcessedService } from './types.ts';

export function processPhoneNumber(phone: string): string {
  let formattedPhone = phone.trim();
  const dddMatch = formattedPhone.match(/(\d+)-(\d+)\((\d+)\)/);
  if (dddMatch) {
    formattedPhone = `(${dddMatch[3]})${dddMatch[1]}-${dddMatch[2]}`;
  }
  return formattedPhone;
}

export function formatCurrency(value: string): string {
  // Remove pontos e zeros extras
  const numericValue = parseFloat(value);
  return `R$ ${numericValue.toFixed(2).replace('.', ',')}`;
}

export function processPaymentInfo(text: string): string {
  if (!text) return '';

  // Processa cada linha separadamente
  return text.split('\n').map(line => {
    // Regex atualizado para capturar qualquer texto adicional após o troco
    const paymentMatch = line.match(/F\.PAGTO\.: Dinheiro: (\d*\.?\d{4}) Levar troco: (\d*\.?\d{4})(.*)/);
    
    if (paymentMatch) {
      const [, mainAmount, changeAmount, additionalText] = paymentMatch;
      
      // Se o troco for zero (0.0000 ou .0000), remove a parte do troco
      if (changeAmount === '.0000' || changeAmount === '0.0000') {
        return `Dinheiro: ${formatCurrency(mainAmount)}${additionalText}`;
      }
      
      // Se houver troco diferente de zero, formata ambos os valores
      return `Dinheiro: ${formatCurrency(mainAmount)} Levar troco: ${formatCurrency(changeAmount)}${additionalText}`;
    }
    
    return line;
  }).join('\n');
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
  
  // Processa informações de pagamento
  observations = processPaymentInfo(observations);
  
  if (service.time_window && !processTimeWindow(service)) {
    observations = observations ? `${observations}\n${service.time_window}` : service.time_window;
  }
  return observations;
}

async function generateUniqueServiceId(supabaseClient: any, baseServiceId: string): Promise<string> {
  // Primeiro, verifica se o ID base já existe
  const { data: existingService } = await supabaseClient
    .from('services')
    .select('service_id')
    .eq('service_id', baseServiceId)
    .maybeSingle();

  if (!existingService) {
    return baseServiceId;
  }

  // Se existe, busca todas as variações com letras
  const { data: variations } = await supabaseClient
    .from('services')
    .select('service_id')
    .like('service_id', `${baseServiceId}%`)
    .order('service_id', { ascending: false });

  if (!variations || variations.length === 0) {
    return `${baseServiceId}B`;
  }

  // Encontra a última letra usada
  const lastVariation = variations[0].service_id;
  const lastLetter = lastVariation.slice(-1);
  
  // Se não for uma letra, começa com 'B'
  if (!/[A-Z]/.test(lastLetter)) {
    return `${baseServiceId}B`;
  }

  // Gera a próxima letra
  const nextLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
  return `${baseServiceId}${nextLetter}`;
}

export async function processService(service: ServiceData, supabaseClient: any): Promise<ProcessedService> {
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

  const baseServiceId = service.code || service.service_id || `${Date.now()}`;
  const uniqueServiceId = await generateUniqueServiceId(supabaseClient, baseServiceId);

  return {
    type: service.type === 'pickup' ? 'coleta' : 
          service.type === 'delivery' ? 'entrega' : 
          service.type || 'coleta',
    service_id: uniqueServiceId,
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
