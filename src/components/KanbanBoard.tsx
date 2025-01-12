import { DeliveryCard } from "./DeliveryCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const [newDelivery, setNewDelivery] = useState({
    code: "",
    type: "delivery",
    customer: "",
    address: "",
    phone: "",
    timeWindow: "",
  });

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

  const handleAddDelivery = async () => {
    if (!newDelivery.code || !newDelivery.customer || !newDelivery.address || !newDelivery.phone) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .insert([{
          code: newDelivery.code,
          customer: newDelivery.customer,
          address: newDelivery.address,
          phone: newDelivery.phone,
          status: 'not-assigned',
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      setNewDelivery({ code: "", type: "delivery", customer: "", address: "", phone: "", timeWindow: "" });
      setIsDialogOpen(false);
      refetch();
      toast.success("Serviço adicionado com sucesso!");
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error("Erro ao adicionar serviço");
    }
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex h-full p-4 space-x-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px]">
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
                // Ensure the status is valid before rendering the card
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="type">Tipo de Serviço</label>
              <Select
                value={newDelivery.type}
                onValueChange={(value) => setNewDelivery({ ...newDelivery, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Entrega</SelectItem>
                  <SelectItem value="pickup">Coleta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="code">ID do Serviço</label>
              <Input
                id="code"
                value={newDelivery.code}
                onChange={(e) => setNewDelivery({ ...newDelivery, code: e.target.value })}
                placeholder="Digite o ID"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="customer">Nome do Cliente</label>
              <Input
                id="customer"
                value={newDelivery.customer}
                onChange={(e) => setNewDelivery({ ...newDelivery, customer: e.target.value })}
                placeholder="Digite o nome do cliente"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address">Endereço</label>
              <Input
                id="address"
                value={newDelivery.address}
                onChange={(e) => setNewDelivery({ ...newDelivery, address: e.target.value })}
                placeholder="Digite o endereço completo"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone">Telefone</label>
              <Input
                id="phone"
                value={newDelivery.phone}
                onChange={(e) => setNewDelivery({ ...newDelivery, phone: e.target.value })}
                placeholder="Digite o telefone"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="timeWindow">Intervalo de Horário</label>
              <Input
                id="timeWindow"
                value={newDelivery.timeWindow}
                onChange={(e) => setNewDelivery({ ...newDelivery, timeWindow: e.target.value })}
                placeholder="Ex: 14:00 - 16:00"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddDelivery}>Adicionar Serviço</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};