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
    sequence_number: number;
    estimated_arrival_time: string;
    service: {
      type: "coleta" | "entrega";
      service_id: string;
      customer_name: string;
      address: string;
      phone: string;
      email: string;
      complement: string;
      time_window: string;
      observations: string;
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
  const navigate = useNavigate();

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
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .route-info {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-card {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
            }
            .stops-list {
              border-top: 2px solid #eee;
              padding-top: 20px;
            }
            .stop-item {
              background: #fff;
              border: 1px solid #eee;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 8px;
            }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            h1 { color: #333; margin-bottom: 30px; }
            h2 { color: #666; font-size: 18px; margin-bottom: 15px; }
            .instructions {
              background: #f0f9ff;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rota: ${route.name}</h1>
            <div class="route-info">
              <div class="info-card">
                <div class="label">Agente</div>
                <div class="value">${route.agent?.name || "Não atribuído"}</div>
              </div>
              <div class="info-card">
                <div class="label">Data/Hora Início</div>
                <div class="value">${new Date(route.start_time).toLocaleString('pt-BR')}</div>
              </div>
              <div class="info-card">
                <div class="label">Status</div>
                <div class="value">${statusTranslations[route.status] || route.status}</div>
              </div>
              <div class="info-card">
                <div class="label">Distância Total</div>
                <div class="value">${route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}</div>
              </div>
              <div class="info-card">
                <div class="label">Tempo Estimado</div>
                <div class="value">${route.total_duration ? `${Math.floor(route.total_duration / 60)}h${route.total_duration % 60}min` : "N/A"}</div>
              </div>
              <div class="info-card">
                <div class="label">Total de Paradas</div>
                <div class="value">${route.route_stops?.length || 0}</div>
              </div>
            </div>
          </div>

          <div class="instructions">
            <h2>Instruções Gerais</h2>
            <ul>
              <li>Verifique todos os documentos necessários antes de iniciar a rota</li>
              <li>Mantenha contato com a base em caso de imprevistos</li>
              <li>Siga a ordem das paradas conforme estabelecido</li>
              <li>Registre qualquer ocorrência no sistema</li>
            </ul>
          </div>

          <div class="stops-list">
            <h2>Lista de Paradas</h2>
            ${route.route_stops?.map((stop, index) => `
              <div class="stop-item">
                <h3>Parada ${index + 1} - ${stop.service.type === 'coleta' ? 'COLETA' : 'ENTREGA'} ${stop.service.service_id}</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                  <div>
                    <div class="label">Cliente</div>
                    <div class="value">${stop.service.customer_name}</div>
                  </div>
                  <div>
                    <div class="label">Telefone</div>
                    <div class="value">${stop.service.phone}</div>
                  </div>
                  <div>
                    <div class="label">Endereço</div>
                    <div class="value">${stop.service.address}</div>
                  </div>
                  <div>
                    <div class="label">Complemento</div>
                    <div class="value">${stop.service.complement || '-'}</div>
                  </div>
                  <div>
                    <div class="label">Janela de Horário</div>
                    <div class="value">${stop.service.time_window || '-'}</div>
                  </div>
                  <div>
                    <div class="label">Chegada Estimada</div>
                    <div class="value">${stop.estimated_arrival_time ? new Date(stop.estimated_arrival_time).toLocaleString('pt-BR') : '-'}</div>
                  </div>
                </div>
                ${stop.service.observations ? `
                  <div style="margin-top: 15px;">
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