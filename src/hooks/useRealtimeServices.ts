import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { debounce } from "lodash-es";

/**
 * Hook centralizado para gerenciar atualizações em tempo real dos serviços
 * Evita múltiplas subscrições redundantes e otimiza as atualizações
 */
export const useRealtimeServices = () => {
  const queryClient = useQueryClient();

  // Debounce para evitar múltiplas atualizações simultâneas
  const debouncedInvalidateServices = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services-kanban"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateAgents = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["agents-data"] });
    }, 500),
    [queryClient]
  );

  useEffect(() => {
    console.log("🔄 Iniciando sistema realtime centralizado...");

    const channel = supabase
      .channel('central-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log("📡 Mudança em serviços:", payload.eventType, (payload.new as any)?.id);
          debouncedInvalidateServices();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_locations'
        },
        (payload) => {
          console.log("📍 Nova localização detectada:", (payload.new as any)?.agent_id);
          debouncedInvalidateAgents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'route_stops'
        },
        (payload) => {
          console.log("🛑 Mudança em paradas:", payload.eventType);
          debouncedInvalidateAgents();
          debouncedInvalidateServices();
        }
      )
      .subscribe((status) => {
        console.log("🔗 Status realtime central:", status);
      });

    return () => {
      console.log("🔌 Desconectando realtime central...");
      supabase.removeChannel(channel);
      debouncedInvalidateServices.cancel();
      debouncedInvalidateAgents.cancel();
    };
  }, [debouncedInvalidateServices, debouncedInvalidateAgents]);

  return {
    // Hook não retorna nada, apenas gerencia as subscrições
  };
};