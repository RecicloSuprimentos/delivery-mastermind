import { useState, useCallback } from "react";
import { useOptimizedServices } from "@/hooks/useOptimizedServices";

/**
 * Hook otimizado para o KanbanBoard
 * Substitui a query complexa por queries separadas e cache inteligente
 */
export const useKanbanData = (searchTerm: string) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Usar o hook otimizado ao invés da query complexa
  const { services, servicesByStatus, isLoading } = useOptimizedServices(searchTerm);

  const handleServiceSelect = useCallback((serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  }, []);

  // Função para compatibilidade (não faz mais fetch direto)
  const fetchServices = useCallback(() => {
    console.log("📝 fetchServices chamado - dados gerenciados pelo cache otimizado");
  }, []);

  return {
    services,
    servicesByStatus,
    selectedServices,
    handleServiceSelect,
    fetchServices,
    isLoading
  };
};
