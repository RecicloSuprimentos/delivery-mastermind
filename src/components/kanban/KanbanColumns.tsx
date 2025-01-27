import { Service } from "@/hooks/useKanbanServices";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanColumnsProps {
  services: Service[];
  selectedServices: string[];
  onServiceSelect: (id: string) => void;
  onServiceUpdate: () => void;
}

export const columns = [
  { id: "not-assigned", title: "Não Atribuído", count: 3 },
  { id: "assigned", title: "Atribuído", count: 0 },
  { id: "accepted", title: "Aceito", count: 0 },
  { id: "in-transit", title: "Em deslocamento", count: 0 },
  { id: "arrived", title: "Chegou ao local", count: 0 },
  { id: "completed", title: "Finalizado hoje", count: 0 },
];

export const KanbanColumns = ({ 
  services, 
  selectedServices, 
  onServiceSelect, 
  onServiceUpdate 
}: KanbanColumnsProps) => {
  return (
    <div className="flex bg-muted h-[calc(100vh-11rem)]">
      {columns.map((column) => (
        <div key={column.id} className="flex-1 min-w-[300px] max-w-[400px]">
          <KanbanColumn
            id={column.id}
            title={column.title}
            services={services}
            onServiceUpdate={onServiceUpdate}
            selectedServices={selectedServices}
            onServiceSelect={onServiceSelect}
          />
        </div>
      ))}
    </div>
  );
};