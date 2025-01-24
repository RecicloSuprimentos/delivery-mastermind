import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Route {
  id: string;
  name: string;
  agent_id: string | null;
  created_at: string;
  route_stops: any[];
  agent?: {
    name: string;
  };
}

export const RoutesList = () => {
  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select(`
          *,
          route_stops (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Para cada rota, buscar informações do agente
      const routesWithAgents = await Promise.all(
        data.map(async (route) => {
          if (!route.agent_id) {
            return {
              ...route,
              agent: { name: "Não atribuído" }
            };
          }

          const { data: { user } } = await supabase.auth.admin.getUserById(route.agent_id);
          return {
            ...route,
            agent: {
              name: user?.user_metadata?.name || "Usuário desconhecido"
            }
          };
        })
      );

      return routesWithAgents;
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Agente</TableHead>
          <TableHead>Criado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routes?.map((route: Route) => (
          <TableRow key={route.id}>
            <TableCell>{route.name}</TableCell>
            <TableCell>{route.agent?.name || "Não atribuído"}</TableCell>
            <TableCell>{new Date(route.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
