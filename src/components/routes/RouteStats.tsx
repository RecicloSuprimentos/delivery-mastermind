import { calculateTimeWindowViolation } from "@/utils/mapUtils";

interface RouteStatsProps {
  distance?: number;
  duration?: number;
  estimatedTimes?: Date[];
  stops?: Array<{ time_window?: string }>;
}

export const RouteStats = ({ distance, duration, estimatedTimes, stops }: RouteStatsProps) => {
  if (!distance && !duration) return null;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes}min`;
  };

  const getTotalTimeWindowViolations = () => {
    if (!estimatedTimes || !stops) return 0;
    return stops.reduce((total, stop, index) => {
      if (!stop.time_window || !estimatedTimes[index]) return total;
      return total + calculateTimeWindowViolation(estimatedTimes[index], stop.time_window);
    }, 0);
  };

  const timeWindowViolations = getTotalTimeWindowViolations();

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm space-y-1">
      <div>Distância total: {(distance / 1000).toFixed(1)} km</div>
      <div>Tempo estimado: {formatDuration(Math.round(duration / 60))}</div>
      {timeWindowViolations > 0 && (
        <div className="text-red-400">
          Violações de janela de tempo: {formatDuration(timeWindowViolations)}
        </div>
      )}
    </div>
  );
};