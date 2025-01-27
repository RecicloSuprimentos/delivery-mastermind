import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./kanban/KanbanColumn";

const columns = [
  { id: "not-assigned", title: "Não Atribuído", count: 3 },
  { id: "assigned", title: "Atribuído", count: 0 },
  { id: "accepted", title: "Aceito", count: 0 },
  { id: "in-transit", title: "Em deslocamento", count: 0 },
  { id: "arrived", title: "Chegou ao local", count: 0 },
  { id: "completed", title: "Finalizado hoje", count: 0 },
];

type ValidStatus = "not-assigned" | "assigned" | "accepted" | "in-transit" | "arrived" | "completed" | "cancelled";

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
  status: ValidStatus;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export const KanbanBoard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const fetchServices = async () => {
    console.log("Buscando serviços...");
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar serviços:", error);
      return;
    }

    if (data) {
      console.log("Serviços encontrados:", data);
      setServices(data as Service[]);
    }
  };

  useEffect(() => {
    fetchServices();

    const channel = supabase
      .channel('services_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `status=neq.cancelled`
        },
        (payload) => {
          console.log("Mudança detectada nos serviços:", payload);
          
          if (payload.eventType === 'INSERT') {
            setServices(prev => [payload.new as Service, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setServices(prev => prev.filter(service => service.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setServices(prev => 
              prev.map(service => 
                service.id === payload.new.id ? payload.new as Service : service
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("Status da inscrição:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex bg-muted">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px] max-w-[400px] p-2">
            <KanbanColumn
              id={column.id}
              title={column.title}
              services={services}
              onServiceUpdate={fetchServices}
              selectedServices={selectedServices}
              onServiceSelect={handleServiceSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};