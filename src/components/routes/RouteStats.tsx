interface RouteStatsProps {
  distance?: number;
  duration?: number;
}

export const RouteStats = ({ distance, duration }: RouteStatsProps) => {
  if (!distance && !duration) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
      {distance && (
        <div>Distância total: {(distance / 1000).toFixed(1)} km</div>
      )}
      {duration && (
        <div>Tempo estimado: {Math.round(duration / 60)} minutos</div>
      )}
    </div>
  );
};