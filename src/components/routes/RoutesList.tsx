
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RouteListItem } from "./route-item";
import { printRoute, statusTranslations } from "./RoutePrintService";
import type { Route } from "@/types/routes";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const RoutesList = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all_active");

  const { data: routes, error, isLoading } = useQuery({
    queryKey: ["routes", statusFilter],
    queryFn: async () => {
      console.log("Iniciando busca de rotas...", { statusFilter });
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

      if (statusFilter === "all_active") {
        query = query.neq("status", "cancelled");
      } else if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
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
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rotas</h1>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all_active">Todas (Ocultar Canceladas)</SelectItem>
              <SelectItem value="all">Exibir Absolutamente Todas</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="assigned">Atribuída</SelectItem>
              <SelectItem value="accepted">Aceita</SelectItem>
              <SelectItem value="in-progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Finalizada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
          Nenhuma rota encontrada para o filtro selecionado.
        </div>
      )}
    </div>
  );
};
