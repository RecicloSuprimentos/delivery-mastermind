import React, { useMemo, useState } from "react";
import { OptimizedKanbanColumn } from "./kanban/OptimizedKanbanColumn";
import { useKanbanData } from "./kanban/useKanbanData";
import { useRealtimeServices } from "@/hooks/useRealtimeServices";
import { isToday, isYesterday, isThisWeek, isThisMonth, isWithinInterval, format } from "date-fns";
import { PeriodOption, CustomDateRange } from "./kanban/CompletedPeriodFilter";

interface KanbanBoardProps {
  searchTerm: string;
}

export const KanbanBoard = ({ searchTerm }: KanbanBoardProps) => {
  // Inicializar sistema realtime centralizado
  useRealtimeServices();
  
  const { servicesByStatus, selectedServices, handleServiceSelect, fetchServices } = useKanbanData(searchTerm);

  const [completedPeriod, setCompletedPeriod] = useState<PeriodOption>("today");
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

  const getCompletedTitle = () => {
    switch (completedPeriod) {
      case "today": return "Finalizado hoje";
      case "yesterday": return "Finalizado ontem";
      case "week": return "Finalizado esta semana";
      case "month": return "Finalizado este mês";
      case "custom":
        if (customDateRange?.from && customDateRange?.to) {
          return `Finalizado: ${format(customDateRange.from, 'dd/MM')} – ${format(customDateRange.to, 'dd/MM')}`;
        }
        return "Finalizados";
      default: return "Finalizados";
    }
  };

  const columns = [
    { id: "not-assigned", title: "Não Atribuído" },
    { id: "assigned", title: "Atribuído" },
    { id: "accepted", title: "Aceito" },
    { id: "in-transit", title: "Em deslocamento" },
    { id: "completed", title: getCompletedTitle() },
  ];

  // Filtro otimizado e dinâmico para serviços completados
  const completedServices = useMemo(() => {
    const completed = servicesByStatus.completed || [];

    if (searchTerm) {
      return completed;
    }

    return completed.filter(service => {
      const rawDate = service.completed_at ?? service.updated_at ?? service.created_at;
      if (!rawDate) return true;
      const completedDate = new Date(rawDate);
      if (isNaN(completedDate.getTime())) return true;

      switch (completedPeriod) {
        case "today": return isToday(completedDate);
        case "yesterday": return isYesterday(completedDate);
        case "week": return isThisWeek(completedDate, { weekStartsOn: 1 });
        case "month": return isThisMonth(completedDate);
        case "custom":
          if (customDateRange?.from && customDateRange?.to) {
            const start = new Date(customDateRange.from);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customDateRange.to);
            end.setHours(23, 59, 59, 999);
            return isWithinInterval(completedDate, { start, end });
          }
          return true;
        default: return true;
      }
    });
  }, [servicesByStatus.completed, searchTerm, completedPeriod, customDateRange]);

  const handlePeriodChange = (period: PeriodOption, range?: CustomDateRange) => {
    setCompletedPeriod(period);
    if (range) {
      setCustomDateRange(range);
    }
  };

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
            currentPeriod={column.id === "completed" ? completedPeriod : undefined}
            customDateRange={column.id === "completed" ? customDateRange : undefined}
            onPeriodChange={column.id === "completed" ? handlePeriodChange : undefined}
          />
        ))}
      </div>
    </div>
  );
};
