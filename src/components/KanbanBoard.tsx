import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ServiceCard from "./ServiceCard";
import DeliveryCard from "./DeliveryCard";

const columns = [
  { id: "not-assigned", title: "Não Atribuído", count: 3 },
  { id: "assigned", title: "Atribuído", count: 0 },
  { id: "accepted", title: "Aceito", count: 0 },
  { id: "in-transit", title: "Em deslocamento", count: 0 },
  { id: "arrived", title: "Chegou ao local", count: 0 },
  { id: "completed", title: "Finalizado hoje", count: 0 },
];

type ValidStatus = "not-assigned" | "assigned" | "accepted" | "in-transit" | "arrived" | "completed";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching services:", error);
      return;
    }

    if (data) {
      setServices(data as Service[]);
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-hidden">
      <div className="fixed top-20 right-8 z-10">
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="default"
          className="bg-success hover:bg-success/90 text-white font-medium shadow-lg"
        >
          <CirclePlus className="mr-2 h-5 w-5" /> SERVIÇO
        </Button>
      </div>

      <div className="flex h-full p-4 space-x-4 overflow-x-auto min-w-full">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="flex-1 min-w-[300px] max-w-[400px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">
                {column.title}
              </h2>
              <span className="bg-muted text-secondary text-sm px-2 py-1 rounded">
                {services.filter(s => s.status === column.id).length}
              </span>
            </div>
            <div className="bg-muted p-4 rounded-lg flex-1 min-h-[calc(100vh-12rem)] overflow-y-auto">
              {services
                .filter(service => service.status === column.id)
                .map((service) => (
                  <ServiceCard 
                    key={service.id}
                    service={service}
                    onUpdate={fetchServices}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DeliveryCard onSuccess={() => {
            setIsDialogOpen(false);
            fetchServices();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};