import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RouteListItem } from "./RouteListItem";
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
    service: {
      type: string;
      service_id: string;
      customer_name: string;
      address: string;
      phone: string;
      email?: string;
      complement?: string;
      time_window?: string;
      observations?: string;
    };
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
  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select(`
          *,
          agent:system_users(name),
          route_stops(
            service_id,
            sequence_number,
            estimated_arrival_time,
            service:services(
              type,
              service_id,
              customer_name,
              address,
              phone,
              email,
              complement,
              time_window,
              observations
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Route[];
    },
  });

  const handlePrint = (route: Route) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatDateTime = (dateString: string) => {
      return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    };

    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h${remainingMinutes}min`;
    };

    const content = `
      <html>
        <head>
          <title>Rota: ${route.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              max-width: 1200px;
              margin: 0 auto;
            }
            .header {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .services {
              margin-top: 30px;
            }
            .service-card {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .label {
              color: #666;
              font-size: 0.9em;
              margin-bottom: 5px;
            }
            .value {
              font-weight: bold;
              font-size: 1.1em;
            }
            h1 { color: #333; margin-bottom: 30px; }
            h2 { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rota: ${route.name}</h1>
            <div class="stats">
              <div class="stat-item">
                <div class="label">Agente</div>
                <div class="value">${route.agent?.name || "Não atribuído"}</div>
              </div>
              <div class="stat-item">
                <div class="label">Data/Hora</div>
                <div class="value">${formatDateTime(route.start_time)}</div>
              </div>
              <div class="stat-item">
                <div class="label">Status</div>
                <div class="value">${statusTranslations[route.status] || route.status}</div>
              </div>
              <div class="stat-item">
                <div class="label">Distância Total</div>
                <div class="value">${route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}</div>
              </div>
              <div class="stat-item">
                <div class="label">Tempo Estimado</div>
                <div class="value">${route.total_duration ? formatDuration(route.total_duration) : "N/A"}</div>
              </div>
            </div>
          </div>

          <div class="services">
            <h2>Serviços (${route.route_stops?.length || 0})</h2>
            ${route.route_stops?.sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0)).map((stop, index) => `
              <div class="service-card">
                <h3>Parada ${index + 1} - ${stop.service.type === 'coleta' ? 'COLETA' : 'ENTREGA'} ${stop.service.service_id}</h3>
                <div class="stats">
                  <div class="stat-item">
                    <div class="label">Cliente</div>
                    <div class="value">${stop.service.customer_name}</div>
                  </div>
                  <div class="stat-item">
                    <div class="label">Endereço</div>
                    <div class="value">${stop.service.address}</div>
                  </div>
                  <div class="stat-item">
                    <div class="label">Telefone</div>
                    <div class="value">${stop.service.phone}</div>
                  </div>
                  ${stop.service.email ? `
                    <div class="stat-item">
                      <div class="label">Email</div>
                      <div class="value">${stop.service.email}</div>
                    </div>
                  ` : ''}
                  ${stop.service.time_window ? `
                    <div class="stat-item">
                      <div class="label">Janela de Tempo</div>
                      <div class="value">${stop.service.time_window}</div>
                    </div>
                  ` : ''}
                  ${stop.estimated_arrival_time ? `
                    <div class="stat-item">
                      <div class="label">Chegada Estimada</div>
                      <div class="value">${formatDateTime(stop.estimated_arrival_time)}</div>
                    </div>
                  ` : ''}
                </div>
                ${stop.service.observations ? `
                  <div class="stat-item" style="margin-top: 15px;">
                    <div class="label">Observações</div>
                    <div class="value">${stop.service.observations}</div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
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