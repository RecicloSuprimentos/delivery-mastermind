import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select(`
          *,
          agent:system_users(name),
          route_stops(service_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Route[];
    },
  });

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
            statusTranslations={statusTranslations}
          />
        ))}
      </div>
    </div>
  );
};