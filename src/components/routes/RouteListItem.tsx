import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Eye } from "lucide-react";
import { RoutePrintLayout } from "./RoutePrintLayout";

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
  route_stops: any[];
}

interface RouteListItemProps {
  route: Route;
  statusTranslations: Record<string, string>;
}

export const RouteListItem = ({ route, statusTranslations }: RouteListItemProps) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Rota: ${route.name}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: A4; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
        </body>
      </html>
    `);

    const printContent = printWindow.document.getElementById('print-content');
    if (printContent) {
      const root = document.createElement('div');
      root.style.margin = '0';
      root.style.padding = '0';
      printContent.appendChild(root);
      
      // @ts-ignore
      import('react-dom/client').then((ReactDOM) => {
        ReactDOM.createRoot(root).render(<RoutePrintLayout route={route} />);
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{route.name}</h3>
            <Badge variant={route.status === "completed" ? "default" : "secondary"}>
              {statusTranslations[route.status] || route.status}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-500">
            Agente: {route.agent?.name || "Não atribuído"}
          </p>
          
          <p className="text-sm text-gray-500">
            Data/Hora: {format(new Date(route.start_time), "PPpp", { locale: ptBR })}
          </p>
          
          <div className="flex gap-4 text-sm text-gray-500">
            <p>
              Distância: {route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}
            </p>
            <p>
              Tempo: {route.total_duration ? `${Math.floor(route.total_duration / 60)}h${route.total_duration % 60}min` : "N/A"}
            </p>
            <p>
              Serviços: {route.route_stops?.length || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Link to={`/routes/new?id=${route.id}&mode=view`}>
            <Button variant="outline" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};