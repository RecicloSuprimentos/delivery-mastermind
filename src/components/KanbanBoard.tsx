import DeliveryCard from "./DeliveryCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CirclePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchDeliveries = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      return;
    }

    setDeliveries(data || []);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

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
                {deliveries.filter(d => d.status === column.id).length}
              </span>
            </div>
            <div className="bg-muted p-4 rounded-lg flex-1 min-h-[calc(100vh-12rem)] overflow-y-auto">
              {deliveries
                .filter(delivery => delivery.status === column.id)
                .map((delivery) => {
                  if (!isValidStatus(delivery.status)) {
                    console.warn(`Invalid status found: ${delivery.status}`);
                    return null;
                  }
                  return (
                    <DeliveryCard 
                      key={delivery.service_id}
                      code={delivery.service_id}
                      customer={delivery.customer_name}
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
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Criar Novo Serviço</h2>
            <DeliveryCard onSuccess={() => {
              setIsDialogOpen(false);
              fetchDeliveries();
              toast({
                title: "Sucesso",
                description: "Serviço criado com sucesso!",
              });
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};