import { KanbanColumn } from "./kanban/KanbanColumn";
import { useKanbanData } from "./kanban/useKanbanData";

const columns = [
  { id: "not-assigned", title: "Não Atribuído" },
  { id: "assigned", title: "Atribuído" },
  { id: "accepted", title: "Aceito" },
  { id: "in-transit", title: "Em deslocamento" },
  { id: "arrived", title: "Chegou ao local" },
  { id: "completed", title: "Finalizado hoje" },
];

interface KanbanBoardProps {
  searchTerm: string;
}

export const KanbanBoard = ({ searchTerm }: KanbanBoardProps) => {
  const { services, selectedServices, handleServiceSelect, fetchServices } = useKanbanData(searchTerm);

  return (
    <div className="flex-1 w-full h-full overflow-hidden">
      <div className="flex h-full p-4 space-x-4 overflow-x-auto min-w-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            services={services.filter(s => s.status === column.id)}
            selectedServices={selectedServices}
            onServiceSelect={handleServiceSelect}
            onServiceUpdate={fetchServices}
          />
        ))}
      </div>
    </div>
  );
};