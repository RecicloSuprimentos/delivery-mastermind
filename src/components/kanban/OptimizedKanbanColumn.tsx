import React, { memo } from "react";
import ServiceCard from "../ServiceCard";
import type { Service } from "@/types/services";

interface OptimizedKanbanColumnProps {
  id: string;
  title: string;
  services: Service[];
  selectedServices: string[];
  onServiceSelect: (serviceId: string) => void;
  onServiceUpdate: () => void;
}

const getVibeColors = (id: string) => {
  switch(id) {
    case 'not-assigned': return { header: 'border-t-[#C4C4C4]', badge: 'bg-[#C4C4C4] text-white' };
    case 'assigned': return { header: 'border-t-vibe-blue', badge: 'bg-vibe-blue text-white' };
    case 'accepted': return { header: 'border-t-vibe-purple', badge: 'bg-vibe-purple text-white' };
    case 'in-transit': return { header: 'border-t-vibe-working', badge: 'bg-vibe-working text-white' };
    case 'completed': return { header: 'border-t-vibe-done', badge: 'bg-vibe-done text-white' };
    default: return { header: 'border-t-gray-300', badge: 'bg-gray-300 text-white' };
  }
};

/**
 * Componente otimizado da coluna Kanban com React.memo
 * Evita re-renders desnecessários quando props não mudam
 */
export const OptimizedKanbanColumn = memo(({
  id,
  title,
  services,
  selectedServices,
  onServiceSelect,
  onServiceUpdate,
}: OptimizedKanbanColumnProps) => {
  const colors = getVibeColors(id);

  return (
    <div className="flex-1 min-w-[220px] max-w-[350px] flex flex-col">
      <div className={`flex items-center justify-between mb-4 pb-2 border-t-4 pt-3 ${colors.header} bg-transparent`}>
        <h2 className="font-bold text-[15px] text-gray-800 tracking-tight">{title}</h2>
        <span className={`${colors.badge} text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm`}>
          {services.length}
        </span>
      </div>
      <div className="bg-transparent flex-1 min-h-[calc(100vh-12rem)] overflow-y-auto px-1">
        <div className="space-y-3 pb-4">
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
});

OptimizedKanbanColumn.displayName = "OptimizedKanbanColumn";