import { useKanbanServices } from "@/hooks/useKanbanServices";
import { KanbanColumns } from "./kanban/KanbanColumns";

export const KanbanBoard = () => {
  const { services, selectedServices, handleServiceSelect, fetchServices } = useKanbanServices();

  return (
    <div className="h-full flex flex-col">
      <KanbanColumns
        services={services}
        selectedServices={selectedServices}
        onServiceSelect={handleServiceSelect}
        onServiceUpdate={fetchServices}
      />
    </div>
  );
};