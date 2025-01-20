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
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
  };

  const handlePrint = (route: Route) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 10px; }
        .header { margin-bottom: 20px; }
        .info { margin-bottom: 5px; font-size: 14px; }
        .section { margin-bottom: 15px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rota: ${route.name}</title>
          ${printStyles}
        </head>
        <body>
          <div class="header">
            <h1>Detalhes da Rota: ${route.name}</h1>
            <div class="info">Data: ${formatDateTime(route.start_time)}</div>
            <div class="info">Agente: ${route.agent?.name || 'Não atribuído'}</div>
            <div class="info">Status: ${statusTranslations[route.status] || route.status}</div>
          </div>
          <div class="section">
            <div class="info">Quantidade de Serviços: ${route.route_stops?.length || 0}</div>
            <div class="info">Distância Estimada: ${route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : 'N/A'}</div>
            <div class="info">Tempo Total Estimado: ${route.total_duration ? formatDuration(route.total_duration) : 'N/A'}</div>
          </div>
          <div class="section">
            <button onclick="window.print()">Imprimir</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rotas</h1>
        <Button onClick={() => navigate("/routes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      <div className="grid gap-3">
        {routes?.map((route) => (
          <div
            key={route.id}
            className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold">{route.name}</h3>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(route.start_time)}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handlePrint(route)}
                    className="h-7 w-7 p-0"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/routes/new?id=${route.id}&mode=view`)}
                    className="h-7 w-7 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/routes/new?id=${route.id}&mode=edit`)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-xs">
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
                  <p className="text-gray-500">Tempo total</p>
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