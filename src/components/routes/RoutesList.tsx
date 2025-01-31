import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RouteListItem } from "./RouteListItem";
import { printRoute, statusTranslations } from "./RoutePrintService";
import type { Route } from "@/types/routes";

export const RoutesList = () => {
  const { data: routes, error, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      console.log("Iniciando busca de rotas...");
      const { data, error } = await supabase
        .from("routes")
        .select(`
          id,
          name,
          agent_id,
          start_time,
          total_distance,
          total_duration,
          status,
          start_location_type,
          start_location_reference,
          end_location_type,
          end_location_reference,
          agent:system_users(name),
          route_stops(service_id)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar rotas:", error);
        throw error;
      }

      console.log("Rotas encontradas:", data);
      return data as Route[];
    },
  });

  if (error) {
    console.error("Erro na query:", error);
    return (
      <div className="p-4 text-red-500">
        Erro ao carregar rotas: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Carregando rotas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rotas</h1>
      </div>

      {routes && routes.length > 0 ? (
        <div className="grid gap-3">
          {routes.map((route) => (
            <RouteListItem
              key={route.id}
              route={route}
              onPrint={printRoute}
              statusTranslations={statusTranslations}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Nenhuma rota encontrada
        </div>
      )}
    </div>
  );
};