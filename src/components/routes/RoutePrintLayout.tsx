import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  phone: string;
  time_window?: string;
  observations?: string;
}

interface Route {
  id: string;
  name: string;
  agent: {
    name: string;
  };
  start_time: string;
  total_distance?: number;
  total_duration?: number;
  status: string;
  route_stops: {
    service: Service;
    sequence_number: number;
    estimated_arrival_time?: string;
  }[];
}

interface RoutePrintLayoutProps {
  route: Route;
}

export const RoutePrintLayout = ({ route }: RoutePrintLayoutProps) => {
  return (
    <div className="p-8 max-w-[210mm] mx-auto bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Rota: {route.name}</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Agente</p>
            <p>{route.agent?.name || "Não atribuído"}</p>
          </div>
          
          <div>
            <p className="font-medium">Data/Hora</p>
            <p>{format(new Date(route.start_time), "PPpp", { locale: ptBR })}</p>
          </div>
          
          <div>
            <p className="font-medium">Distância Total</p>
            <p>{route.total_distance ? `${(route.total_distance / 1000).toFixed(1)} km` : "N/A"}</p>
          </div>
          
          <div>
            <p className="font-medium">Tempo Estimado</p>
            <p>
              {route.total_duration 
                ? `${Math.floor(route.total_duration / 60)}h${route.total_duration % 60}min` 
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Serviços</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 text-left">Seq.</th>
              <th className="py-2 text-left">Tipo</th>
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">Cliente</th>
              <th className="py-2 text-left">Endereço</th>
              <th className="py-2 text-left">Telefone</th>
              <th className="py-2 text-left">Horário</th>
            </tr>
          </thead>
          <tbody>
            {route.route_stops?.map((stop, index) => (
              <tr key={stop.service.id} className="border-b border-gray-200">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">
                  {stop.service.type === "coleta" ? "Coleta" : "Entrega"}
                </td>
                <td className="py-2">{stop.service.service_id}</td>
                <td className="py-2">{stop.service.customer_name}</td>
                <td className="py-2">{stop.service.address}</td>
                <td className="py-2">{stop.service.phone}</td>
                <td className="py-2">{stop.service.time_window || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};