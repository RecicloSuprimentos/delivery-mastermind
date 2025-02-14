
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useKanbanData } from "./kanban/useKanbanData";
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
  const { services, selectedServices, handleServiceSelect, fetchServices } = useKanbanData(searchTerm);

  const filterCompletedServices = (services: any[]) => {
    if (searchTerm) {
      return services.filter(s => s.status === "completed" || s.status === "cancelled");
    }
    
    return services.filter(s => {
      if (s.status !== "completed" && s.status !== "cancelled") return false;
      const completedDate = new Date(s.completed_at || s.updated_at || s.created_at);
      return isToday(completedDate);
    });
  };

  return (
    <div className="flex-1 w-full h-full overflow-hidden">
      <div className="flex h-full px-2 space-x-2 overflow-x-auto min-w-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            services={column.id === "completed" 
              ? filterCompletedServices(services)
              : services.filter(s => s.status === column.id)
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
