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
  'assigned': 'Atribuída',
  'in-progress': 'Em Andamento',
  'completed': 'Finalizada',
  'cancelled': 'Cancelada'
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
    return `${hours}h${remainingMinutes}min`;
  };

  const handlePrint = (route: Route) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate the print content
    const content = `
      <html>
        <head>
          <title>Rota: ${route.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .info { margin-bottom: 10px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Rota: ${route.name}</h1>
          <div class="info">
            <span class="label">Agente:</span> ${route.agent?.name || "Não atribuído"}
          </div>
          <div class="info">
            <span class="label">Data/Hora:</span> ${formatDateTime(route.start_time)}
          </div>
          <div class="info">
            <span class="label">Status:</span> ${statusTranslations[route.status] || route.status}
          </div>
          <div class="info">
            <span class="label">Distância:</span> ${route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}
          </div>
          <div class="info">
            <span class="label">Tempo Estimado:</span> ${route.total_duration ? formatDuration(route.total_duration) : "N/A"}
          </div>
          <div class="info">
            <span class="label">Número de Serviços:</span> ${route.route_stops?.length || 0}
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window and print
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
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
            className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm"
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
                  <p className="font-medium">Em breve</p>
                </div>
                <div>
                  <p className="text-gray-500">Tempo estimado</p>
                  <p className="font-medium">
                    {route.total_duration ? formatDuration(route.total_duration) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tempo gasto</p>
                  <p className="font-medium">Em breve</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};