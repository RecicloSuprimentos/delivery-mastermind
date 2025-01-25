import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";
import { useToast } from "./use-toast";

export const useRouteStatusSync = () => {
  const { updateServiceStatus } = useServices();
  const { toast } = useToast();
  const processedRoutes = useRef(new Set<string>());
  const isProcessing = useRef(false);
  const mountedRef = useRef(true);

  const updateServicesForRoute = async (routeId: string) => {
    // Verificações de segurança
    if (!mountedRef.current) return;
    if (processedRoutes.current.has(routeId)) {
      console.log("[RouteSync] Rota já processada, ignorando:", routeId);
      return;
    }
    if (isProcessing.current) {
      console.log("[RouteSync] Processamento em andamento, ignorando nova requisição");
      return;
    }

    console.log("[RouteSync] Iniciando processamento da rota:", routeId);
    isProcessing.current = true;

    try {
      // Verifica se a rota ainda está com status 'accepted'
      const { data: route, error: routeError } = await supabase
        .from("routes")
        .select("status")
        .eq("id", routeId)
        .single();

      if (routeError) {
        console.error("[RouteSync] Erro ao verificar status da rota:", routeError);
        return;
      }

      if (route?.status !== "accepted") {
        console.log("[RouteSync] Rota não está mais com status 'accepted', ignorando");
        return;
      }

      // Busca os serviços da rota
      const { data: routeStops, error: stopsError } = await supabase
        .from("route_stops")
        .select("service_id")
        .eq("route_id", routeId);

      if (stopsError) {
        console.error("[RouteSync] Erro ao buscar paradas da rota:", stopsError);
        return;
      }

      if (!routeStops?.length) {
        console.log("[RouteSync] Nenhum serviço encontrado para a rota:", routeId);
        return;
      }

      // Atualiza os serviços sequencialmente
      for (const stop of routeStops) {
        if (!mountedRef.current) return; // Verifica se o componente ainda está montado

        try {
          await updateServiceStatus.mutateAsync({
            serviceId: stop.service_id,
            status: "accepted"
          });
          console.log("[RouteSync] Serviço atualizado com sucesso:", stop.service_id);
        } catch (error) {
          console.error("[RouteSync] Erro ao atualizar serviço:", error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar um dos serviços da rota",
            variant: "destructive",
          });
          return;
        }
      }

      // Marca a rota como processada apenas se tudo deu certo
      processedRoutes.current.add(routeId);
      console.log("[RouteSync] Rota processada com sucesso:", routeId);

    } catch (error) {
      console.error("[RouteSync] Erro inesperado:", error);
    } finally {
      if (mountedRef.current) {
        isProcessing.current = false;
      }
    }
  };

  useEffect(() => {
    console.log("[RouteSync] Iniciando monitoramento de rotas");
    mountedRef.current = true;

    // Processa rotas já aceitas apenas uma vez na inicialização
    const syncExistingRoutes = async () => {
      if (!mountedRef.current) return;

      const { data: acceptedRoutes, error } = await supabase
        .from("routes")
        .select("id")
        .eq("status", "accepted");

      if (error) {
        console.error("[RouteSync] Erro ao buscar rotas aceitas:", error);
        return;
      }

      if (acceptedRoutes?.length) {
        console.log("[RouteSync] Processando rotas existentes:", acceptedRoutes.length);
        for (const route of acceptedRoutes) {
          if (!mountedRef.current) return;
          await updateServicesForRoute(route.id);
        }
      }
    };

    // Monitora apenas mudanças de status para 'accepted'
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
          if (!mountedRef.current) return;
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
      console.log("[RouteSync] Finalizando monitoramento de rotas");
      mountedRef.current = false;
      supabase.removeChannel(channel);
      processedRoutes.current.clear();
      isProcessing.current = false;
    };
  }, [updateServiceStatus, toast]);
};