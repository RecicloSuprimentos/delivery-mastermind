import { Button } from "@/components/ui/button";
import { Printer, Eye, Edit, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRoutes } from "@/hooks/useRoutes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Route {
  id: string;
  name: string;
  agent_id: string;
  start_time: string;
  total_distance: number;
  total_duration: number;
  status: string;
  agent: {
    name: string;
  } | null;
  route_stops: {
    service_id: string;
  }[];
}

interface RouteListItemProps {
  route: Route;
  onPrint: (route: Route) => void;
  statusTranslations: Record<string, string>;
}

export const RouteListItem = ({ route, onPrint, statusTranslations }: RouteListItemProps) => {
  const navigate = useNavigate();
  const { updateRouteStatus } = useRoutes();

  // Busca os dados reais de distância e tempo
  const { data: realStats } = useQuery({
    queryKey: ["route-stats", route.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_route_distance', {
          route_id_param: route.id
        });

      if (error) {
        console.error("Error fetching route stats:", error);
        return null;
      }

      return data?.[0] || null;
    },
    enabled: route.status !== 'draft' // Só busca dados se a rota não estiver em rascunho
  });

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes}min`;
  };

  // Formata a duração do intervalo retornado pela função
  const formatIntervalDuration = (interval: string) => {
    const matches = interval.match(/(\d+):(\d+):(\d+)/);
    if (!matches) return "0h0min";
    
    const [_, hours, minutes] = matches;
    return `${hours}h${minutes}min`;
  };

  const handleAcceptRoute = async () => {
    try {
      await updateRouteStatus.mutateAsync({
        routeId: route.id,
        status: 'accepted'
      });
    } catch (error) {
      console.error("Error accepting route:", error);
    }
  };

  return (
    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold">{route.name}</h3>
            <p className="text-xs text-gray-500">
              {formatDateTime(route.start_time)}
            </p>
          </div>
          <div className="flex space-x-1">
            {route.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAcceptRoute}
                className="h-6 w-6 p-0"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onPrint(route)}
              className="h-6 w-6 p-0"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/routes/new?id=${route.id}&mode=view`)}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/routes/new?id=${route.id}&mode=edit`)}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Agente</p>
            <p className="font-medium truncate">{route.agent?.name || "Não atribuído"}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium">{statusTranslations[route.status] || route.status}</p>
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
      </div>
    </div>
  );
};