
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Service, ValidStatus } from "@/types/services";
import type { Database } from "@/integrations/supabase/types";

type ServiceResponse = Database['public']['Tables']['services']['Row'];

export const useKanbanData = (searchTerm: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const formatService = (service: ServiceResponse): Service => ({
    ...service,
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
    assigned_to: service.assigned_to ? {
      id: (service.assigned_to as any).id,
      name: (service.assigned_to as any).name
    } : undefined
  });

  const fetchServices = async () => {
    console.log("Buscando serviços...");
    const { data, error } = await supabase
      .from("services")
      .select("*, completed_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar serviços:", error);
      return;
    }

    if (data) {
      console.log("Serviços encontrados:", data);
      const formattedServices: Service[] = data.map(formatService);
      setServices(formattedServices);
    }
  };

  useEffect(() => {
    fetchServices();

    const channel = supabase
      .channel('services_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log("Mudança detectada nos serviços:", payload);
          
          if (payload.eventType === 'INSERT') {
            const newService = payload.new as ServiceResponse;
            const formattedService = formatService(newService);
            setServices(prev => [formattedService, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setServices(prev => prev.filter(service => service.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            const updatedService = payload.new as ServiceResponse;
            const formattedService = formatService(updatedService);
            setServices(prev => 
              prev.map(service => 
                service.id === payload.new.id ? formattedService : service
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("Status da inscrição:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const filterServices = (services: Service[], searchTerm: string) => {
    if (!searchTerm.trim()) return services;
    
    const term = searchTerm.toLowerCase().trim();
    return services.filter(service => {
      return (
        service.service_id.toLowerCase().includes(term) ||
        service.customer_name.toLowerCase().includes(term) ||
        service.address.toLowerCase().includes(term) ||
        service.phone.toLowerCase().includes(term) ||
        (service.email?.toLowerCase().includes(term) || false) ||
        (service.observations?.toLowerCase().includes(term) || false)
      );
    });
  };

  const filteredServices = filterServices(services, searchTerm);

  return {
    services: filteredServices,
    selectedServices,
    handleServiceSelect,
    fetchServices
  };
};
