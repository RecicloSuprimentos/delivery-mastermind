
import { Route } from "@/types/routes";

const statusTranslations: Record<string, string> = {
  'draft': 'Rascunho',
  'assigned': 'Atribuída',
  'accepted': 'Aceita',
  'in-progress': 'Em Andamento',
  'completed': 'Finalizada',
  'cancelled': 'Cancelada'
};

export const printRoute = (route: Route) => {
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

export { statusTranslations };
