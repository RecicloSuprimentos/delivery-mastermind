import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";

interface Route {
  id: string;
  name: string;
  agent_id: string;
  start_time: string;
  total_distance: number;
  total_duration: number;
  agent: {
    name: string;
  };
}

export const RoutesList = () => {
  const navigate = useNavigate();

  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select(`
          *,
          agent:system_users(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Route[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rotas</h1>
        <Button onClick={() => navigate("/routes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      <div className="grid gap-4">
        {routes?.map((route) => (
          <div
            key={route.id}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{route.name}</h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Agente: {route.agent?.name}</div>
                  <div>
                    Data: {new Date(route.start_time).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{route.total_distance?.toFixed(1)} km</div>
                <div>{route.total_duration} min</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};