import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRoutes = () => {
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "agent")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createRoute = useMutation({
    mutationFn: async (routeData) => {
      const { error } = await supabase
        .from("routes")
        .insert(routeData);

      if (error) throw error;
      toast.success("Rota criada com sucesso!");
      queryClient.invalidateQueries(["routes"]);
    },
  });

  const updateRoute = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from("routes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      toast.success("Rota atualizada com sucesso!");
      queryClient.invalidateQueries(["routes"]);
    },
  });

  const deleteRoute = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Rota deletada com sucesso!");
      queryClient.invalidateQueries(["routes"]);
    },
  });

  return {
    agents,
    isLoadingRoutes,
    routes,
    createRoute,
    updateRoute,
    deleteRoute,
  };
};
