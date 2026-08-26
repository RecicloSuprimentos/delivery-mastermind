import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Service, ValidStatus } from "@/types/services";
import type { Database } from "@/integrations/supabase/types";
import { useMemo } from "react";

type ServiceResponse = Database['public']['Tables']['services']['Row'];

/**
 * Hook otimizado para buscar dados dos serviços
 * Usa queries separadas e cache inteligente para melhor performance
 */
export const useOptimizedServices = (searchTerm: string = "") => {
  // Query básica dos serviços - muito mais rápida
  const { data: rawServices, isLoading } = useQuery({
    queryKey: ["services-kanban"],
    queryFn: async () => {
      console.log("🚀 Buscando serviços otimizado...");
      const { data, error } = await supabase
        .from("services")
        .select(`
          id,
          type,
          service_id,
          customer_name,
          address,
          phone,
          email,
          complement,
          time_window,
          observations,
          status,
          latitude,
          longitude,
          created_at,
          updated_at,
          completed_at,
          completion_details,
          failure_details
        `)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar serviços:", error);
        throw error;
      }

      // Log de diagnóstico para verificar se os campos JSONB chegam
      const withPOD = (data || []).filter((s: any) => s.completion_details !== null);
      console.log(`✅ Serviços carregados: ${data?.length || 0} (com POD: ${withPOD.length})`);
      if (withPOD.length > 0) {
        console.log("📦 Exemplo POD:", JSON.stringify(withPOD[0].completion_details));
      }

      return data || [];
    },
    // Cache por 5 minutos com stale-while-revalidate
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para dados relacionados (agentes) - apenas quando necessário
  const { data: agentsData } = useQuery({
    queryKey: ["services-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("route_stops")
        .select(`
          service_id,
          routes!inner(
            agent_id,
            agent:system_users!inner(id, name)
          )
        `);

      if (error) throw error;

      // Criar mapa para acesso O(1)
      const agentMap = new Map();
      data?.forEach(stop => {
        const route = stop.routes as any;
        if (route?.agent) {
          agentMap.set(stop.service_id, {
            id: route.agent.id,
            name: route.agent.name
          });
        }
      });

      return agentMap;
    },
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
    enabled: !!rawServices?.length,
  });

  // Formatar serviços de forma otimizada
  const services = useMemo(() => {
    if (!rawServices) return [];

    return rawServices.map((service): Service => ({
      id: service.id,
      type: service.type,
      service_id: service.service_id,
      customer_name: service.customer_name,
      address: service.address,
      phone: service.phone,
      email: service.email || undefined,
      complement: service.complement || undefined,
      time_window: service.time_window || undefined,
      observations: service.observations || undefined,
      status: (service.status || 'not-assigned') as ValidStatus,
      latitude: service.latitude || undefined,
      longitude: service.longitude || undefined,
      created_at: service.created_at || undefined,
      updated_at: service.updated_at || undefined,
      completed_at: service.completed_at || undefined,
      completion_details: service.completion_details
        ? (service.completion_details as Service["completion_details"])
        : undefined,
      failure_details: service.failure_details
        ? (service.failure_details as Service["failure_details"])
        : undefined,
      assigned_to: agentsData?.get(service.id),
    }));
  }, [rawServices, agentsData]);

  // Filtrar serviços de forma otimizada
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    
    const term = searchTerm.toLowerCase().trim();
    return services.filter(service => {
      return (
        (service.service_id?.toLowerCase() || "").includes(term) ||
        (service.customer_name?.toLowerCase() || "").includes(term) ||
        (service.address?.toLowerCase() || "").includes(term) ||
        (service.phone?.toLowerCase() || "").includes(term) ||
        (service.email?.toLowerCase() || "").includes(term) ||
        (service.observations?.toLowerCase() || "").includes(term)
      );
    });
  }, [services, searchTerm]);

  // Agrupar serviços por status para acesso O(1)
  const servicesByStatus = useMemo(() => {
    const groups: Record<string, Service[]> = {
      'not-assigned': [],
      'assigned': [],
      'accepted': [],
      'in-transit': [],
      'completed': [],
      'cancelled': []
    };

    filteredServices.forEach(service => {
      if (groups[service.status]) {
        groups[service.status].push(service);
      }
    });

    return groups;
  }, [filteredServices]);

  return {
    services: filteredServices,
    servicesByStatus,
    isLoading,
  };
};