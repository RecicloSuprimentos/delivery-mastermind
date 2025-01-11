import { DeliveryCard } from "./DeliveryCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const columns = [
  { id: "not-assigned", title: "Não Atribuído", count: 3 },
  { id: "assigned", title: "Atribuído", count: 0 },
  { id: "accepted", title: "Aceito", count: 0 },
  { id: "in-transit", title: "Em deslocamento", count: 0 },
  { id: "arrived", title: "Chegou ao local", count: 0 },
  { id: "completed", title: "Finalizado hoje", count: 0 },
];

const sampleDeliveries = [
  {
    code: "457818",
    customer: "LUCIANA MOREIRA SOUZA DE CARVALHO",
    address: "RUA DOUTOR ANTÔNIO GONÇALVES DE MATOS, 345 - CENTRO, SÃO PAULO - SP",
    phone: "(11) 98765-4321",
    status: "pending" as const,
  },
  {
    code: "469141",
    customer: "CS FOMENTO MERCANTIL LTDA",
    address: "AVENIDA BIAS FORTES, 349 - LOURDES, BELO HORIZONTE - MG",
    phone: "(31) 98765-4321",
    status: "pending" as const,
  },
  {
    code: "470609",
    customer: "REGINA FLAVIA",
    address: "RUA JOÃO MANSUR NFURI, 120 - JARDIM PAULISTA, SÃO PAULO - SP",
    phone: "(11) 98765-4322",
    status: "pending" as const,
  },
];

export const KanbanBoard = () => {
  const [deliveries, setDeliveries] = useState(sampleDeliveries);
  const [newDelivery, setNewDelivery] = useState({
    code: "",
    customer: "",
    address: "",
    phone: "",
  });

  const handleAddDelivery = () => {
    if (!newDelivery.code || !newDelivery.customer || !newDelivery.address || !newDelivery.phone) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const delivery = {
      ...newDelivery,
      status: "pending" as const,
    };

    setDeliveries([delivery, ...deliveries]);
    setNewDelivery({ code: "", customer: "", address: "", phone: "" });
    toast.success("Serviço adicionado com sucesso!");
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
                {column.count}
              </span>
            </div>
            <div className="bg-muted p-4 rounded-lg min-h-[calc(100vh-12rem)]">
              {column.id === "not-assigned" && deliveries.map((delivery) => (
                <DeliveryCard key={delivery.code} {...delivery} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="code">Código da Entrega</label>
              <Input
                id="code"
                value={newDelivery.code}
                onChange={(e) => setNewDelivery({ ...newDelivery, code: e.target.value })}
                placeholder="Digite o código"
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
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddDelivery}>Adicionar Serviço</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};