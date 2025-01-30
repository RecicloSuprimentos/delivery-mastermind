import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const getShiftByHour = (hour: number): string => {
  if (hour >= 5 && hour < 12) return "MANHÃ";
  if (hour >= 12 && hour < 18) return "TARDE";
  return "NOITE";
};

export const generateRouteName = (date: Date = new Date()): string => {
  const shift = getShiftByHour(date.getHours());
  const formattedDate = format(date, "dd-MM-yyyy", { locale: ptBR });
  return `${shift} ${formattedDate}`;
};