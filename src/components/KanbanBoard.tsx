
import React, { useMemo } from "react";
import { OptimizedKanbanColumn } from "./kanban/OptimizedKanbanColumn";
import { useKanbanData } from "./kanban/useKanbanData";
import { useRealtimeServices } from "@/hooks/useRealtimeServices";
import { isToday } from "date-fns";

const columns = [
  { id: "not-assigned", title: "Não Atribuído" },
  { id: "assigned", title: "Atribuído" },
  { id: "accepted", title: "Aceito" },
  { id: "in-transit", title: "Em deslocamento" },
  { id: "completed", title: "Finalizado hoje" },
];

interface KanbanBoardProps {
  searchTerm: string;
}

export const KanbanBoard = ({ searchTerm }: KanbanBoardProps) => {
  // Inicializar sistema realtime centralizado
  useRealtimeServices();
  
  const { servicesByStatus, selectedServices, handleServiceSelect, fetchServices } = useKanbanData(searchTerm);

  // Filtro otimizado para serviços completados
  const completedServices = useMemo(() => {
    const completed = servicesByStatus.completed || [];
    const cancelled = servicesByStatus.cancelled || [];
    const allCompletedAndCancelled = [...completed, ...cancelled];
    
    if (searchTerm) {
      return allCompletedAndCancelled;
    }
    
    return allCompletedAndCancelled.filter(service => {
      const completedDate = new Date(service.completed_at || service.updated_at || service.created_at);
      return isToday(completedDate);
    });
  }, [servicesByStatus.completed, servicesByStatus.cancelled, searchTerm]);

  return (
    <div className="flex-1 w-full h-full overflow-hidden">
      <div className="flex h-full px-2 space-x-2 overflow-x-auto min-w-full">
        {columns.map((column) => (
          <OptimizedKanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            services={column.id === "completed" 
              ? completedServices
              : servicesByStatus[column.id] || []
            }
            selectedServices={selectedServices}
            onServiceSelect={handleServiceSelect}
            onServiceUpdate={fetchServices}
          />
        ))}
      </div>
    </div>
  );
};
