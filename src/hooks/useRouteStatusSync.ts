import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "./useServices";
import { useToast } from "./use-toast";

// Interface para a fila de processamento
interface ProcessingQueue {
  routeId: string;
  status: string;
}

export const useRouteStatusSync = () => {
  const { updateServiceStatus } = useServices();
  const { toast } = useToast();
  const processedRoutes = useRef(new Set<string>());
  const processingQueue = useRef<ProcessingQueue[]>([]);
  const isProcessing = useRef(false);
  const mountedRef = useRef(true);

  // Função para processar a fila
  const processQueue = async () => {
    if (!mountedRef.current || isProcessing.current || processingQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    const { routeId, status } = processingQueue.current[0];

    try {
      // Verifica se a rota já foi processada
      if (processedRoutes.current.has(routeId)) {
        processingQueue.current.shift();
        isProcessing.current = false;
        processQueue();
        return;
      }

      // Verifica o status atual da rota
      const { data: route } = await supabase
        .from("routes")
        .select("status")
        .eq("id", routeId)
        .single();

      if (route?.status !== status) {
        processingQueue.current.shift();
        isProcessing.current = false;
        processQueue();
        return;
      }

      // Busca os serviços da rota
      const { data: routeStops } = await supabase
        .from("route_stops")
        .select("service_id")
        .eq("route_id", routeId);

      if (routeStops?.length) {
        for (const stop of routeStops) {
          if (!mountedRef.current) return;

          await updateServiceStatus.mutateAsync({
            serviceId: stop.service_id,
            status: "accepted"
          });
        }
      }

      // Marca a rota como processada
      processedRoutes.current.add(routeId);
      processingQueue.current.shift();

    } catch (error) {
      console.error("[RouteSync] Erro ao processar rota:", error);
      toast({
        title: "Erro",
        description: "Erro ao sincronizar status dos serviços",
        variant: "destructive",
      });
    } finally {
      if (mountedRef.current) {
        isProcessing.current = false;
        // Processa o próximo item da fila
        processQueue();
      }
    }
  };

  // Adiciona uma rota à fila de processamento
  const addToQueue = (routeId: string, status: string) => {
    if (!processedRoutes.current.has(routeId)) {
      processingQueue.current.push({ routeId, status });
      processQueue();
    }
  };

  useEffect(() => {
    console.log("[RouteSync] Iniciando monitoramento");
    mountedRef.current = true;

    // Processa rotas já aceitas
    const syncExistingRoutes = async () => {
      const { data: acceptedRoutes } = await supabase
        .from("routes")
        .select("id")
        .eq("status", "accepted");

      if (acceptedRoutes?.length) {
        console.log("[RouteSync] Processando rotas existentes:", acceptedRoutes.length);
        acceptedRoutes.forEach(route => addToQueue(route.id, "accepted"));
      }
    };

    // Monitora mudanças de status
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
        (payload) => {
          if (!mountedRef.current) return;
          if (payload.old?.status !== "accepted" && payload.new?.status === "accepted") {
            addToQueue(payload.new.id, "accepted");
          }
        }
      )
      .subscribe();

    // Sincroniza rotas existentes
    syncExistingRoutes();

    // Cleanup
    return () => {
      console.log("[RouteSync] Finalizando monitoramento");
      mountedRef.current = false;
      supabase.removeChannel(channel);
      processedRoutes.current.clear();
      processingQueue.current = [];
      isProcessing.current = false;
    };
  }, [updateServiceStatus, toast]);
};