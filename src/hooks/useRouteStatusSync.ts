import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";
import { useToast } from "./use-toast";

export const useRouteStatusSync = () => {
  const { updateServiceStatus } = useServices();
  const { toast } = useToast();
  const processedRoutes = useRef(new Set<string>());
  const isProcessing = useRef(false);

  const updateServicesForRoute = async (routeId: string) => {
    // Evita processamento duplicado
    if (processedRoutes.current.has(routeId)) {
      console.log("Rota já processada:", routeId);
      return;
    }

    // Evita processamento simultâneo
    if (isProcessing.current) {
      console.log("Processamento em andamento, aguardando...");
      return;
    }

    try {
      isProcessing.current = true;
      console.log("Iniciando atualização dos serviços da rota:", routeId);

      const { data: routeStops, error: stopsError } = await supabase
        .from("route_stops")
        .select("service_id")
        .eq("route_id", routeId);

      if (stopsError) {
        console.error("Erro ao buscar paradas da rota:", stopsError);
        return;
      }

      if (!routeStops?.length) {
        console.log("Nenhum serviço encontrado para a rota:", routeId);
        return;
      }

      // Atualiza os serviços em sequência para evitar sobrecarga
      for (const stop of routeStops) {
        try {
          await updateServiceStatus.mutateAsync({
            serviceId: stop.service_id,
            status: "accepted"
          });
          console.log("Serviço atualizado com sucesso:", stop.service_id);
        } catch (error) {
          console.error("Erro ao atualizar serviço:", error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar um dos serviços da rota",
            variant: "destructive",
          });
          return; // Interrompe o processamento em caso de erro
        }
      }

      // Marca a rota como processada apenas se todos os serviços foram atualizados
      processedRoutes.current.add(routeId);
      console.log("Rota processada com sucesso:", routeId);

    } finally {
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    console.log("Iniciando monitoramento de rotas...");

    // Processa rotas já aceitas apenas uma vez na inicialização
    const syncExistingRoutes = async () => {
      const { data: acceptedRoutes, error } = await supabase
        .from("routes")
        .select("id")
        .eq("status", "accepted");

      if (error) {
        console.error("Erro ao buscar rotas aceitas:", error);
        return;
      }

      if (acceptedRoutes?.length) {
        console.log("Processando rotas existentes:", acceptedRoutes.length);
        for (const route of acceptedRoutes) {
          await updateServicesForRoute(route.id);
        }
      }
    };

    // Monitora apenas mudanças relevantes de status
    const channel = supabase
      .channel("route_status_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "routes",
          filter: "status=accepted"
        },
        async (payload) => {
          if (payload.old?.status !== "accepted" && payload.new?.status === "accepted") {
            await updateServicesForRoute(payload.new.id);
          }
        }
      )
      .subscribe();

    // Sincroniza rotas existentes
    syncExistingRoutes();

    // Cleanup
    return () => {
      console.log("Finalizando monitoramento de rotas...");
      supabase.removeChannel(channel);
      processedRoutes.current.clear();
      isProcessing.current = false;
    };
  }, [updateServiceStatus, toast]);
};