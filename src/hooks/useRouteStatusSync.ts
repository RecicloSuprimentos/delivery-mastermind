import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";

export const useRouteStatusSync = () => {
  const { updateServiceStatus } = useServices();

  useEffect(() => {
    console.log("Iniciando monitoramento de status das rotas...");

    const handleRouteStatusChange = async (payload: any) => {
      console.log("Mudança detectada na rota:", payload);

      // Verifica se é uma atualização e se o novo status é 'accepted'
      if (
        payload.eventType === "UPDATE" &&
        payload.new.status === "accepted" &&
        payload.old.status !== "accepted"
      ) {
        const routeId = payload.new.id;
        console.log("Rota aceita, buscando serviços vinculados...", routeId);

        // Busca os serviços vinculados à rota
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
          
          // Atualiza o status de cada serviço
          for (const stop of routeStops) {
            try {
              await updateServiceStatus.mutateAsync({
                serviceId: stop.service_id,
                status: "accepted"
              });
              console.log("Status do serviço atualizado:", stop.service_id);
            } catch (error) {
              console.error("Erro ao atualizar serviço:", error);
            }
          }
        }
      }
    };

    // Inscreve no canal para receber atualizações das rotas
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

    // Cleanup
    return () => {
      console.log("Desativando monitoramento de status das rotas...");
      supabase.removeChannel(channel);
    };
  }, [updateServiceStatus]);
};