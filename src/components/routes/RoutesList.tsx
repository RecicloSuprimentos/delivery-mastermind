
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RouteListItem } from "./route-item";
import { printRoute, statusTranslations } from "./RoutePrintService";
import type { Route } from "@/types/routes";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const filters = [
  { id: 'all_active', label: 'Ativas' },
  { id: 'assigned', label: 'Atribuída' },
  { id: 'accepted', label: 'Aceita' },
  { id: 'in-progress', label: 'Em Andamento' },
  { id: 'completed', label: 'Finalizada' },
  { id: 'cancelled', label: 'Cancelada' },
  { id: 'all', label: 'Todas' },
];

export const RoutesList = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all_active");
  const { ref, inView } = useInView();

  const { 
    data, 
    error, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["routes", statusFilter],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      console.log("Iniciando busca de rotas...", { statusFilter, pageParam });
      
      const limit = pageParam === 0 ? 20 : 10;
      const from = pageParam === 0 ? 0 : 20 + (pageParam - 1) * 10;
      const to = from + limit - 1;

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
        .order("created_at", { ascending: false })
        .range(from, to);

      if (statusFilter === "all_active") {
        query = query.neq("status", "cancelled");
      } else if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data: routeData, error } = await query;

      if (error) {
        console.error("Erro ao buscar rotas:", error);
        throw error;
      }

      return routeData as Route[];
    },
    getNextPageParam: (lastPage, allPages) => {
      const isFirstPage = allPages.length === 1;
      const limit = isFirstPage ? 20 : 10;
      if (lastPage && lastPage.length === limit) {
        return allPages.length;
      }
      return undefined;
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const routes = data?.pages.flatMap((page) => page) || [];

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Rotas</h1>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                statusFilter === filter.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-4 text-red-500 bg-red-50 border border-red-100 rounded-lg">
          Erro ao carregar rotas: {error.message}
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
          Carregando rotas...
        </div>
      ) : routes && routes.length > 0 ? (
        <div className="grid gap-3">
          {routes.map((route) => (
            <RouteListItem
              key={route.id}
              route={route}
              onPrint={printRoute}
              statusTranslations={statusTranslations}
            />
          ))}
          
          <div ref={ref} className="py-4 text-center text-sm text-gray-500">
            {isFetchingNextPage 
              ? "Buscando rotas mais antigas..." 
              : hasNextPage 
                ? "Role para baixo para carregar mais" 
                : "Fim da lista"}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
          Nenhuma rota encontrada para o filtro selecionado.
        </div>
      )}
    </div>
  );
};
