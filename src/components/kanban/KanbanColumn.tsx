
import ServiceCard from "../ServiceCard";
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
    <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="bg-muted text-secondary text-sm px-2 py-1 rounded">
          {services.length}
        </span>
      </div>
      <div className="bg-muted p-2 rounded-lg flex-1 min-h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="space-y-2">
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
    </div>
  );
};
