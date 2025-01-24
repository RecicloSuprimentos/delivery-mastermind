import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];
type RouteUpdate = Database["public"]["Tables"]["routes"]["Update"];

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
    mutationFn: async (routeData: RouteInsert) => {
      const { data, error } = await supabase
        .from("routes")
        .insert(routeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Rota criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const updateRoute = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RouteUpdate }) => {
      const { data: updatedRoute, error } = await supabase
        .from("routes")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedRoute;
    },
    onSuccess: () => {
      toast.success("Rota atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const deleteRoute = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rota deletada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["routes"] });
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