
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useRouteMutations = (routeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveRoute = useMutation({
    mutationFn: async ({ routeData, stops }: { routeData: RouteInsert, stops: { service_id: string }[] }) => {
      if (routeId) {
        // Modo Edição
        console.log("[DEBUG] Iniciando edição de rota", { routeId, routeData, stops });
        
        // 1. Atualizar dados da rota
        const { data: updatedRoute, error: updateError } = await supabase
          .from("routes")
          .update({
            name: routeData.name,
            agent_id: routeData.agent_id,
            start_time: routeData.start_time,
            start_location_type: routeData.start_location_type,
            start_location_reference: routeData.start_location_reference,
            end_location_type: routeData.end_location_type,
            end_location_reference: routeData.end_location_reference,
            total_distance: routeData.total_distance,
            total_duration: routeData.total_duration,
          })
          .eq("id", routeId)
          .select()
          .single();

        if (updateError) {
          console.error("[DEBUG] Erro ao atualizar rota:", updateError);
          throw updateError;
        }

        console.log("[DEBUG] Rota atualizada:", updatedRoute);

        // 2. Buscar paradas existentes
        const { data: existingStops, error: fetchError } = await supabase
          .from("route_stops")
          .select("service_id, sequence_number")
          .eq("route_id", routeId)
          .order('sequence_number', { ascending: true });
          
        if (fetchError) {
          console.error("[DEBUG] Erro ao buscar paradas existentes:", fetchError);
          throw fetchError;
        }

        console.log("[DEBUG] Paradas atuais:", existingStops);

        // 3. Identificar mudanças nos serviços
        const currentStops = existingStops.map(stop => stop.service_id);
        const newStops = stops.map(stop => stop.service_id);
        
        const removedStops = currentStops.filter(id => !newStops.includes(id));
        const addedStops = newStops.filter(id => !currentStops.includes(id));
        
        console.log("[DEBUG] Análise de mudanças:", {
          removedStops,
          addedStops
        });

        // 4. Atualizar status dos serviços removidos
        if (removedStops.length > 0) {
          console.log("[DEBUG] Atualizando status dos serviços removidos");
          const { error: resetError } = await supabase
            .from("services")
            .update({ status: "not-assigned" })
            .in("id", removedStops);

          if (resetError) {
            console.error("[DEBUG] Erro ao resetar status dos serviços removidos:", resetError);
            throw resetError;
          }

          // 5. Remover paradas dos serviços removidos
          console.log("[DEBUG] Removendo paradas dos serviços removidos");
          const { error: deleteError } = await supabase
            .from("route_stops")
            .delete()
            .eq("route_id", routeId)
            .in("service_id", removedStops);

          if (deleteError) {
            console.error("[DEBUG] Erro ao deletar paradas removidas:", deleteError);
            throw deleteError;
          }
        }

        // 6. Calcular o maior sequence_number existente
        const maxSequence = existingStops.reduce((max, stop) => 
          Math.max(max, stop.sequence_number), 0);

        // 7. Inserir novas paradas com sequence_number correto
        if (addedStops.length > 0) {
          console.log("[DEBUG] Inserindo novas paradas a partir do sequence_number:", maxSequence + 1);
          const newRouteStops = stops
            .filter(stop => addedStops.includes(stop.service_id))
            .map((service, index) => ({
              route_id: routeId,
              service_id: service.service_id,
              sequence_number: maxSequence + index + 1,
            }));

          const { error: insertError } = await supabase
            .from("route_stops")
            .insert(newRouteStops);

          if (insertError) {
            console.error("[DEBUG] Erro ao inserir novas paradas:", insertError);
            throw insertError;
          }

          console.log("[DEBUG] Atualizando status dos novos serviços");
          const { error: servicesError } = await supabase
            .from("services")
            .update({ status: "assigned" })
            .in("id", addedStops);

          if (servicesError) {
            console.error("[DEBUG] Erro ao atualizar status dos novos serviços:", servicesError);
            throw servicesError;
          }
        }

        return updatedRoute;

      } else {
        // Modo Criação
        console.log("[DEBUG] Modo criação - Inserindo nova rota");
        const { data, error } = await supabase
          .from("routes")
          .insert({ ...routeData, status: 'assigned' })
          .select()
          .single();

        if (error) {
          console.error("[DEBUG] Erro ao criar nova rota:", error);
          throw error;
        }
        
        console.log("[DEBUG] Nova rota criada:", data);
        
        if (stops.length > 0) {
          console.log("[DEBUG] Inserindo paradas para nova rota");
          const routeStops = stops.map((service, index) => ({
            route_id: data.id,
            service_id: service.service_id,
            sequence_number: index + 1,
          }));

          const { error: stopsError } = await supabase
            .from("route_stops")
            .insert(routeStops);

          if (stopsError) {
            console.error("[DEBUG] Erro ao inserir paradas:", stopsError);
            throw stopsError;
          }

          console.log("[DEBUG] Atualizando status dos serviços");
          const { error: servicesError } = await supabase
            .from("services")
            .update({ status: "assigned" })
            .in("id", stops.map(s => s.service_id));

          if (servicesError) {
            console.error("[DEBUG] Erro ao atualizar status dos serviços:", servicesError);
            throw servicesError;
          }
        }
        
        return data;
      }
    },
    onSuccess: () => {
      console.log("[DEBUG] Operação concluída com sucesso - Invalidando cache");
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
    onError: (error) => {
      console.error("[DEBUG] Erro na operação:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a rota. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    },
  });

  const updateRouteStatus = useMutation({
    mutationFn: async ({ routeId, status }: { routeId: string; status: string }) => {
      const { data: route, error } = await supabase
        .from("routes")
        .update({ status })
        .eq("id", routeId)
        .select()
        .single();

      if (error) throw error;
      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  return {
    saveRoute,
    updateRouteStatus,
  };
};
