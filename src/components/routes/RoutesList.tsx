import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, Printer, Eye, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  };
  route_stops: {
    service_id: string;
  }[];
}

const statusTranslations: Record<string, string> = {
  'draft': 'Rascunho',
  'pending': 'Pendente',
  'in-progress': 'Em Progresso',
  'completed': 'Finalizado',
  'cancelled': 'Cancelado'
};

export const RoutesList = () => {
  const navigate = useNavigate();

  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select(`
          *,
          agent:system_users(name),
          route_stops(service_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Route[];
    },
  });

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rotas</h1>
        <Button onClick={() => navigate("/routes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      <div className="grid gap-4">
        {routes?.map((route) => (
          <div
            key={route.id}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{route.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(route.start_time)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/routes/${route.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/routes/${route.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Agente</p>
                  <p className="font-medium">{route.agent?.name || "Não atribuído"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{statusTranslations[route.status] || route.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serviços</p>
                  <p className="font-medium">{route.route_stops?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Km estimada</p>
                  <p className="font-medium">{route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Km percorrida</p>
                  <p className="font-medium">Pendente</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tempo total</p>
                  <p className="font-medium">
                    {route.total_duration ? formatDuration(route.total_duration) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};