
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Route } from "@/types/routes";
import { formatDuration, formatIntervalDuration } from "./utils";

interface RouteStatsProps {
  route: Route;
}

export const RouteStats = ({ route }: RouteStatsProps) => {
  const { data: realStats } = useQuery({
    queryKey: ["route-stats", route.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_route_distance', {
          route_id_param: route.id
        });

      if (error) {
        console.error("Error fetching route stats:", error);
        throw error;
      }

      if (data && data[0]) {
        return {
          total_distance: Number(data[0].total_distance),
          total_duration: data[0].total_duration as string
        };
      }

      return {
        total_distance: 0,
        total_duration: '00:00:00'
      };
    },
    enabled: route.status !== 'draft'
  });

  return (
    <div className="grid grid-cols-7 gap-2 text-xs">
      <div>
        <p className="text-gray-500">Agente</p>
        <p className="font-medium truncate">{route.agent?.name || "Não atribuído"}</p>
      </div>
      <div>
        <p className="text-gray-500">Status</p>
        <p className="font-medium">{route.status}</p>
      </div>
      <div>
        <p className="text-gray-500">Serviços</p>
        <p className="font-medium">{route.route_stops?.length || 0}</p>
      </div>
      <div>
        <p className="text-gray-500">Km estimada</p>
        <p className="font-medium">{route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}</p>
      </div>
      <div>
        <p className="text-gray-500">Km percorrida</p>
        <p className="font-medium">
          {realStats?.total_distance 
            ? `${(realStats.total_distance / 1000).toFixed(1)} km` 
            : "N/A"}
        </p>
      </div>
      <div>
        <p className="text-gray-500">Tempo estimado</p>
        <p className="font-medium">
          {route.total_duration ? formatDuration(route.total_duration) : "N/A"}
        </p>
      </div>
      <div>
        <p className="text-gray-500">Tempo gasto</p>
        <p className="font-medium">
          {realStats?.total_duration 
            ? formatIntervalDuration(realStats.total_duration) 
            : "N/A"}
        </p>
      </div>
    </div>
  );
};
