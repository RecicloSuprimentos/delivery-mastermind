
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Route } from "@/types/routes";
import { formatDuration, formatIntervalDuration } from "./utils";
import { statusTranslations } from "../RoutePrintService";

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

  const getVibeStatusColor = (status: string) => {
    switch(status) {
      case 'not-assigned': return 'bg-[#C4C4C4] text-white';
      case 'assigned': return 'bg-vibe-blue text-white';
      case 'accepted': return 'bg-vibe-purple text-white';
      case 'in-transit': return 'bg-vibe-working text-white';
      case 'completed': return 'bg-vibe-done text-white';
      case 'cancelled': return 'bg-vibe-stuck text-white';
      default: return 'bg-gray-300 text-white';
    }
  };

  return (
    <div className="grid grid-cols-7 gap-4 text-xs mt-2">
      <div>
        <p className="text-gray-500 mb-1">Agente</p>
        <p className="font-medium truncate text-[13px]">{route.agent?.name || "Não atribuído"}</p>
      </div>
      <div>
        <p className="text-gray-500 mb-1">Status</p>
        <div className="flex">
          <span className={`${getVibeStatusColor(route.status)} px-2.5 py-1 rounded-full font-bold text-[11px] shadow-sm uppercase tracking-wider`}>
            {statusTranslations[route.status] || route.status}
          </span>
        </div>
      </div>
      <div>
        <p className="text-gray-500 mb-1">Serviços</p>
        <p className="font-medium text-[13px]">{route.route_stops?.length || 0}</p>
      </div>
      <div>
        <p className="text-gray-500 mb-1">Km estimada</p>
        <p className="font-medium text-[13px]">{route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}</p>
      </div>
      <div>
        <p className="text-gray-500 mb-1">Km percorrida</p>
        <p className="font-medium text-[13px]">
          {realStats?.total_distance 
            ? `${(realStats.total_distance / 1000).toFixed(1)} km` 
            : "N/A"}
        </p>
      </div>
      <div>
        <p className="text-gray-500 mb-1">Tempo estimado</p>
        <p className="font-medium text-[13px]">
          {route.total_duration ? formatDuration(route.total_duration) : "N/A"}
        </p>
      </div>
      <div>
        <p className="text-gray-500 mb-1">Tempo gasto</p>
        <p className="font-medium text-[13px]">
          {realStats?.total_duration 
            ? formatIntervalDuration(realStats.total_duration) 
            : "N/A"}
        </p>
      </div>
    </div>
  );
};
