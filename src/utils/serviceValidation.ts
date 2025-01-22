export const validateServiceForm = (
  serviceType: string,
  location: { lat: number; lng: number } | null,
  customerName: string,
  phone: string,
  address: string
) => {
  if (!serviceType) {
    return "Por favor, selecione o tipo de serviço";
  }

  if (!location) {
    return "Por favor, selecione um endereço válido";
  }

  if (!customerName || !phone || !address) {
    return "Por favor, preencha todos os campos obrigatórios";
  }

  return null;
};