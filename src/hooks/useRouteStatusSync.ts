import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";
import { useToast } from "./use-toast";

export const useRouteStatusSync = () => {
  const { updateServiceStatus } = useServices();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Iniciando monitoramento de status das rotas...");

    // Função para atualizar serviços de uma rota
    const updateServicesForRoute = async (routeId: string) => {
      console.log("Atualizando serviços para rota:", routeId);
      
      const { data: routeStops, error: stopsError } = await supabase
        .from("route_stops")
        .select("service_id")
        .eq("route_id", routeId);

      if (stopsError) {
        console.error("Erro ao buscar paradas da rota:", stopsError);
        return;
      }

      if (routeStops && routeStops.length > 0) {
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

        // Mostra uma única notificação ao final das atualizações
        if (errorCount > 0) {
          toast({
            title: "Atenção",
            description: `${errorCount} serviços não puderam ser atualizados`,
            variant: "destructive",
          });
        }
      }
    };

    // Verifica rotas já aceitas e atualiza seus serviços
    const syncExistingAcceptedRoutes = async () => {
      console.log("Verificando rotas já aceitas...");
      
      const { data: acceptedRoutes, error } = await supabase
        .from("routes")
        .select("id")
        .eq("status", "accepted");

      if (error) {
        console.error("Erro ao buscar rotas aceitas:", error);
        return;
      }

      if (acceptedRoutes && acceptedRoutes.length > 0) {
        console.log("Rotas aceitas encontradas:", acceptedRoutes);
        for (const route of acceptedRoutes) {
          await updateServicesForRoute(route.id);
        }
      }
    };

    // Executa sincronização inicial
    syncExistingAcceptedRoutes();

    // Monitora mudanças futuras
    const handleRouteStatusChange = async (payload: any) => {
      console.log("Mudança detectada na rota:", payload);

      if (
        payload.eventType === "UPDATE" &&
        payload.new.status === "accepted" &&
        payload.old.status !== "accepted"
      ) {
        const routeId = payload.new.id;
        await updateServicesForRoute(routeId);
      }
    };

    const channel = supabase
      .channel("route_status_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "routes",
        },
        handleRouteStatusChange
      )
      .subscribe();

    return () => {
      console.log("Desativando monitoramento de status das rotas...");
      supabase.removeChannel(channel);
    };
  }, [updateServiceStatus, toast]);
};