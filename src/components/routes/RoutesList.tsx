
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RouteListItem } from "./route-item";
import { printRoute, statusTranslations } from "./RoutePrintService";
import type { Route } from "@/types/routes";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export const RoutesList = () => {
  const [showCancelled, setShowCancelled] = useState(false);

  const { data: routes, error, isLoading } = useQuery({
    queryKey: ["routes", showCancelled],
    queryFn: async () => {
      console.log("Iniciando busca de rotas...", { showCancelled });
      let query = supabase
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

      if (!showCancelled) {
        query = query.neq("status", "cancelled");
      }

      const { data, error } = await query;

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
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-cancelled"
            checked={showCancelled}
            onCheckedChange={(checked) => setShowCancelled(checked as boolean)}
          />
          <label
            htmlFor="show-cancelled"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Exibir rotas canceladas
          </label>
        </div>
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
