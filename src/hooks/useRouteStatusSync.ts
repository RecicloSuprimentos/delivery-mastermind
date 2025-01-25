import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";
import { useToast } from "./use-toast";

export const useRouteStatusSync = () => {
  // Temporariamente desativado para teste
  return;

  /* Original code commented out for testing
  const { updateServiceStatus } = useServices();
  const { toast } = useToast();
  const processedRouteIds = useRef(new Set<string>());
  const isProcessing = useRef(false);

  useEffect(() => {
    console.log("Iniciando monitoramento de status das rotas...");

    // Função para atualizar serviços de uma rota
    const updateServicesForRoute = async (routeId: string) => {
      // Evita processamento simultâneo
      if (isProcessing.current) {
        console.log("Já existe um processamento em andamento, aguardando...");
        return;
      }

      // Evita processar a mesma rota mais de uma vez
      if (processedRouteIds.current.has(routeId)) {
        console.log("Rota já processada:", routeId);
        return;
      }

      try {
        isProcessing.current = true;
        console.log("Atualizando serviços para rota:", routeId);
        
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

        console.log("Serviços encontrados:", routeStops);
        let errorCount = 0;
        
        for (const stop of routeStops) {
          try {
            await updateServiceStatus.mutateAsync({
              serviceId: stop.service_id,
              status: "accepted"
            });
            console.log("Status do serviço atualizado:", stop.service_id);
          } catch (error) {
            console.error("Erro ao atualizar serviço:", error);
            errorCount++;
          }
        }

        if (errorCount > 0) {
          toast({
            title: "Atenção",
            description: `${errorCount} serviços não puderam ser atualizados`,
            variant: "destructive",
          });
        }

        // Marca a rota como processada apenas se não houver erros
        if (errorCount === 0) {
          processedRouteIds.current.add(routeId);
        }
      } finally {
        isProcessing.current = false;
      }
    };

    // Verifica rotas já aceitas e atualiza seus serviços (apenas uma vez)
    const syncExistingAcceptedRoutes = async () => {
      if (isProcessing.current) return;

      console.log("Verificando rotas já aceitas...");
      
      const { data: acceptedRoutes, error } = await supabase
        .from("routes")
        .select("id")
        .eq("status", "accepted");

      if (error) {
        console.error("Erro ao buscar rotas aceitas:", error);
        return;
      }

      if (!acceptedRoutes?.length) {
        console.log("Nenhuma rota aceita encontrada");
        return;
      }

      console.log("Rotas aceitas encontradas:", acceptedRoutes);
      for (const route of acceptedRoutes) {
        await updateServicesForRoute(route.id);
      }
    };

    // Monitora mudanças futuras
    const handleRouteStatusChange = async (payload: any) => {
      console.log("Mudança detectada na rota:", payload);

      if (
        payload.eventType === "UPDATE" &&
        payload.new.status === "accepted" &&
        payload.old.status !== "accepted"
      ) {
        await updateServicesForRoute(payload.new.id);
      }
    };

    // Executa sincronização inicial apenas uma vez
    syncExistingAcceptedRoutes();

    // Configura o canal de monitoramento
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
        handleRouteStatusChange
      )
      .subscribe();

    return () => {
      console.log("Desativando monitoramento de status das rotas...");
      processedRouteIds.current.clear();
      isProcessing.current = false;
      supabase.removeChannel(channel);
    };
  }, [updateServiceStatus, toast]);
  */
};