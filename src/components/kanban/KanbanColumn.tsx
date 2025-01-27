import React from "react";
import ServiceCard from "../ServiceCard";
import { KanbanColumnHeader } from "./KanbanColumnHeader";

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  phone: string;
  email?: string;
  complement?: string;
  time_window?: string;
  observations?: string;
  status: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  services: Service[];
  onServiceUpdate: () => void;
  selectedServices: string[];
  onServiceSelect: (id: string) => void;
}

export const KanbanColumn = ({
  id,
  title,
  services,
  onServiceUpdate,
  selectedServices,
  onServiceSelect,
}: KanbanColumnProps) => {
  const filteredServices = services.filter((service) => service.status === id);

  return (
    <div className="flex-1 min-w-[300px] max-w-[400px] p-2">
      <KanbanColumnHeader title={title} count={filteredServices.length} />
      <div className="bg-muted rounded-lg h-[calc(100vh-12rem)] overflow-y-auto scrollbar-none hover:scrollbar-thin mt-2">
        <div className="p-4 space-y-3">
          {filteredServices.map((service) => (
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