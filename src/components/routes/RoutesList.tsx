import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RouteListItem } from "./RouteListItem";
import { printRoute, statusTranslations } from "./RoutePrintService";
import type { Route } from "@/types/routes";

export const RoutesList = () => {
  const { data: routes, error, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      console.log("Fetching routes...");
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
          agent:system_users(name),
          route_stops(service_id)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching routes:", error);
        throw error;
      }

      console.log("Routes data:", data);
      return data as Route[];
    },
  });

  if (isLoading) {
    return <div>Carregando rotas...</div>;
  }

  if (error) {
    console.error("Error in routes component:", error);
    return <div>Erro ao carregar rotas: {(error as Error).message}</div>;
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