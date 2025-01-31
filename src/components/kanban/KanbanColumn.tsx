import { ServiceCard } from "../ServiceCard";
import type { Service } from "@/types/services";

interface KanbanColumnProps {
  id: string;
  title: string;
  services: Service[];
  selectedServices: string[];
  onServiceSelect: (serviceId: string) => void;
  onServiceUpdate: () => void;
}

export const KanbanColumn = ({
  id,
  title,
  services,
  selectedServices,
  onServiceSelect,
  onServiceUpdate,
}: KanbanColumnProps) => {
  return (
    <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="bg-muted text-secondary text-sm px-2 py-1 rounded">
          {services.length}
        </span>
      </div>
      <div className="bg-muted p-4 rounded-lg flex-1 min-h-[calc(100vh-12rem)] overflow-y-auto">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onUpdate={onServiceUpdate}
            isSelected={selectedServices.includes(service.id)}
            onSelect={onServiceSelect}
          />
        ))}
      </div>
    </div>
  );
};