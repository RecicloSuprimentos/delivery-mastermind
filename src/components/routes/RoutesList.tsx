import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { RouteListItem } from "./RouteListItem";

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

  const handlePrint = (route: Route) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
            <span class="label">Data/Hora:</span> ${route.start_time}
          </div>
          <div class="info">
            <span class="label">Status:</span> ${statusTranslations[route.status] || route.status}
          </div>
          <div class="info">
            <span class="label">Distância:</span> ${route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}
          </div>
          <div class="info">
            <span class="label">Tempo Estimado:</span> ${route.total_duration ? `${Math.floor(route.total_duration / 60)}h${route.total_duration % 60}min` : "N/A"}
          </div>
          <div class="info">
            <span class="label">Número de Serviços:</span> ${route.route_stops?.length || 0}
          </div>
        </body>
      </html>
    `;

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
          <RouteListItem
            key={route.id}
            route={route}
            onPrint={handlePrint}
            statusTranslations={statusTranslations}
          />
        ))}
      </div>
    </div>
  );
};