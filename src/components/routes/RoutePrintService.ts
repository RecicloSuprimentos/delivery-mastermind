
import { Route } from "@/types/routes";

const statusTranslations: Record<string, string> = {
  'draft': 'Rascunho',
  'assigned': 'Atribuída',
  'accepted': 'Aceita',
  'in-progress': 'Em Andamento',
  'completed': 'Finalizada',
  'cancelled': 'Cancelada'
};

import { supabase } from "@/integrations/supabase/client";

export const printRoute = async (route: Route) => {
  try {
    // Busca todas as paradas dessa rota em ordem
    const { data: routeStops, error } = await supabase
      .from('route_stops')
      .select('*, service:services(*)')
      .eq('route_id', route.id)
      .order('sequence_number', { ascending: true });

    if (error) {
      console.error("Erro ao buscar detalhes da rota para impressão:", error);
      throw error;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error("Bloqueador de pop-up impediu a abertura da janela de impressão.");
      return;
    }

    const formatTime = (timeStr?: string) => timeStr ? timeStr.substring(0, 5) : "";
    
    let formattedDuration = "-";
    if (route.total_duration) {
      const totalMinutes = Math.floor(route.total_duration / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      formattedDuration = hours > 0 ? `${hours}h${minutes}min` : `${minutes}min`;
    }
    
    // Montando as linhas da tabela
    const rowsHtml = routeStops?.map((stop, index) => {
      const s = stop.service;
      const typeBadge = s.type === 'coleta' 
        ? '<span class="badge badge-coleta">COLETA</span>'
        : '<span class="badge badge-entrega">ENTREGA</span>';
      
      const timeWindow = s.time_window 
        ? `<br><small><strong>Janela:</strong> ${formatTime(s.time_window.split(',')[0])} às ${formatTime(s.time_window.split(',')[1])}</small>`
        : '';
        
      const obs = s.observations ? `<br><small><strong>Obs:</strong> ${s.observations}</small>` : '';

      return `
        <tr>
          <td class="text-center"><strong>${index + 1}</strong></td>
          <td>
            <strong>${s.customer_name}</strong><br>
            ${s.phone || '-'}
          </td>
          <td>${typeBadge}</td>
          <td>
            ${s.address}
            ${obs}
            ${timeWindow}
          </td>
          <td class="checkbox-cell"></td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5" class="text-center">Nenhum serviço atrelado a esta rota.</td></tr>';

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rota: ${route.name}</title>
          <style>
            @page { 
              size: A4; 
              margin: 5mm; 
            }
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              color: #1a1a1a;
              font-size: 14px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h1 { font-size: 24px; margin-top: 0; margin-bottom: 2px; color: #111; border-bottom: 2px solid #000; padding-bottom: 4px; line-height: 1.1; }
            .header-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-bottom: 8px;
              background: #f8f9fc;
              padding: 8px 12px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
            }
            .info-item { margin-bottom: 4px; font-size: 13px; }
            .label { font-weight: bold; color: #475569; }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 8px 10px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
              color: #334155;
              font-size: 15px;
            }
            .text-center { text-align: center; }
            .checkbox-cell { width: 50px; }
            
            .badge {
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
              display: inline-block;
              color: white;
            }
            .badge-coleta { background-color: #3b82f6; } /* vibe-blue */
            .badge-entrega { background-color: #10b981; } /* vibe-green */
            
            .signature-area {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              padding: 0 20px;
            }
            .signature-box {
              width: 40%;
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 5px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <h1>Documento de Rota: ${route.name}</h1>
          
          <div class="header-grid">
            <div>
              <div class="info-item"><span class="label">Agente/Motorista:</span> ${route.agent?.name || "Não atribuído"}</div>
              <div class="info-item"><span class="label">Data de Início:</span> ${route.start_time ? new Date(route.start_time).toLocaleString('pt-BR') : '-'}</div>
              <div class="info-item"><span class="label">Status:</span> ${statusTranslations[route.status] || route.status}</div>
            </div>
            <div>
              <div class="info-item"><span class="label">Distância Prevista:</span> ${route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "-"}</div>
              <div class="info-item"><span class="label">Tempo Previsto:</span> ${formattedDuration}</div>
              <div class="info-item"><span class="label">Qtd de Paradas:</span> ${routeStops?.length || 0}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;" class="text-center">Seq</th>
                <th style="width: 25%;">Cliente</th>
                <th style="width: 80px;">Tipo</th>
                <th style="width: auto;">Endereço & Detalhes</th>
                <th class="checkbox-cell">Visto</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          
          <div class="signature-area">
            <div class="signature-box">
              Assinatura do Motorista
            </div>
            <div class="signature-box">
              Assinatura do Despacho
            </div>
          </div>
          
          <script>
            // Aguarda as imagens (se houver) carregarem e dispara a impressão
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  } catch (error) {
    throw error;
  }
};

export { statusTranslations };
