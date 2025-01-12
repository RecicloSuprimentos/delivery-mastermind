import { DeliveryCard } from "./DeliveryCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ServiceForm } from "./ServiceForm";

const columns = [
  { id: "not-assigned", title: "Não Atribuído", count: 3 },
  { id: "assigned", title: "Atribuído", count: 0 },
  { id: "accepted", title: "Aceito", count: 0 },
  { id: "in-transit", title: "Em deslocamento", count: 0 },
  { id: "arrived", title: "Chegou ao local", count: 0 },
  { id: "completed", title: "Finalizado hoje", count: 0 },
];

type ValidStatus = "not-assigned" | "assigned" | "accepted" | "in-transit" | "arrived" | "completed";

const isValidStatus = (status: string): status is ValidStatus => {
  return ["not-assigned", "assigned", "accepted", "in-transit", "arrived", "completed"].includes(status);
};

export const KanbanBoard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: deliveries = [], refetch } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="flex-1 overflow-x-auto w-full">
      <div className="fixed top-20 right-8 z-10">
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="default"
          className="bg-success hover:bg-success/90 text-white font-medium"
        >
          <Plus className="mr-2 h-4 w-4" /> SERVIÇO
        </Button>
      </div>

      <div className="flex h-full p-4 space-x-4 min-w-full overflow-x-auto">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px] max-w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">
                {column.title}
              </h2>
              <span className="bg-muted text-secondary text-sm px-2 py-1 rounded">
                {column.id === "not-assigned" ? deliveries.length : 0}
              </span>
            </div>
            <div className="bg-muted p-4 rounded-lg min-h-[calc(100vh-12rem)]">
              {column.id === "not-assigned" && deliveries.map((delivery) => {
                if (!isValidStatus(delivery.status)) {
                  console.warn(`Invalid status found: ${delivery.status}`);
                  return null;
                }
                return (
                  <DeliveryCard 
                    key={delivery.code}
                    code={delivery.code}
                    customer={delivery.customer}
                    address={delivery.address}
                    phone={delivery.phone}
                    status={delivery.status as ValidStatus}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <ServiceForm 
            onClose={() => setIsDialogOpen(false)}
            onSuccess={() => {
              setIsDialogOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};