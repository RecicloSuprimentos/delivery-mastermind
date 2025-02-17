
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useRouteMutations = (routeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveRoute = useMutation({
    mutationFn: async (routeData: RouteInsert) => {
      // Garantir que o status seja 'draft' durante o salvamento inicial
      const dataWithStatus = {
        ...routeData,
        status: 'draft'
      };
      
      console.log("Iniciando salvamento da rota:", { dataWithStatus, routeId });
      
      let savedRoute;
      if (routeId) {
        const { data, error } = await supabase
          .from("routes")
          .update(dataWithStatus)
          .eq("id", routeId)
          .select()
          .single();

        if (error) {
          console.error("Erro ao atualizar rota:", error);
          throw error;
        }
        
        savedRoute = data;
        console.log("Rota atualizada com sucesso:", savedRoute);
      } else {
        const { data, error } = await supabase
          .from("routes")
          .insert(dataWithStatus)
          .select()
          .single();

        if (error) {
          console.error("Erro ao criar rota:", error);
          throw error;
        }
        
        savedRoute = data;
        console.log("Rota criada com sucesso:", savedRoute);
      }

      // Após salvar, atualizar o status para 'assigned'
      const { data: updatedRoute, error: updateError } = await supabase
        .from("routes")
        .update({ status: 'assigned' })
        .eq("id", savedRoute.id)
        .select()
        .single();

      if (updateError) {
        console.error("Erro ao atualizar status da rota:", updateError);
        throw updateError;
      }

      console.log("Status da rota atualizado para assigned:", updatedRoute);
      return updatedRoute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast({
        title: "Sucesso",
        description: routeId ? "Rota atualizada com sucesso!" : "Rota criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro detalhado ao salvar rota:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a rota.",
        variant: "destructive",
      });
    },
  });

  const updateRouteStatus = useMutation({
    mutationFn: async ({ routeId, status }: { routeId: string; status: string }) => {
      console.log("Atualizando status da rota:", { routeId, status });
      
      const { data: route, error } = await supabase
        .from("routes")
        .update({ status })
        .eq("id", routeId)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar status da rota:", error);
        throw error;
      }
      
      console.log("Status da rota atualizado com sucesso:", route);
      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast({
        title: "Sucesso",
        description: "Status da rota atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status da rota:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status da rota.",
        variant: "destructive",
      });
    },
  });

  return {
    saveRoute,
    updateRouteStatus,
  };
};
