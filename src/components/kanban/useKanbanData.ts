
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Service } from "@/types/services";

export const useKanbanData = (searchTerm: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

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
      setServices(data as Service[]);
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
            setServices(prev => [payload.new as Service, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setServices(prev => prev.filter(service => service.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setServices(prev => 
              prev.map(service => 
                service.id === payload.new.id ? payload.new as Service : service
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
