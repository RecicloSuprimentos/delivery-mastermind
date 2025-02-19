
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDateTime = (dateString: string) => {
  return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h${minutes}min`;
};

export const formatIntervalDuration = (interval: string) => {
  const matches = interval.match(/(\d+):(\d+):(\d+)/);
  if (!matches) return "0h0min";
  
  const [_, hours, minutes] = matches;
  return `${hours}h${minutes}min`;
};
