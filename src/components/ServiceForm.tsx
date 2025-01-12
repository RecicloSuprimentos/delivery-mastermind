import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface ServiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceForm = ({ onClose, onSuccess }: ServiceFormProps) => {
  const [newService, setNewService] = useState({
    code: "",
    type: "delivery",
    customer: "",
    address: "",
    phone: "",
    timeWindow: "",
    notes: "",
  });

  const handleAddService = async () => {
    if (!newService.code || !newService.customer || !newService.address || !newService.phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .insert([{
          code: newService.code,
          customer: newService.customer,
          address: newService.address,
          phone: newService.phone,
          status: 'not-assigned',
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      onSuccess();
      toast.success("Serviço adicionado com sucesso!");
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error("Erro ao adicionar serviço");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-semibold">Novo Serviço</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <label className="font-medium text-sm">Tipo de Serviço</label>
          <Select
            value={newService.type}
            onValueChange={(value) => setNewService({ ...newService, type: value })}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivery">Entrega</SelectItem>
              <SelectItem value="pickup">Coleta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="font-medium text-sm">ID do Serviço *</label>
          <Input
            value={newService.code}
            onChange={(e) => setNewService({ ...newService, code: e.target.value })}
            placeholder="Digite o ID"
            className="bg-white"
          />
        </div>

        <div className="grid gap-2">
          <label className="font-medium text-sm">Nome do Cliente *</label>
          <Input
            value={newService.customer}
            onChange={(e) => setNewService({ ...newService, customer: e.target.value })}
            placeholder="Digite o nome do cliente"
            className="bg-white"
          />
        </div>

        <div className="grid gap-2">
          <label className="font-medium text-sm">Telefone *</label>
          <Input
            value={newService.phone}
            onChange={(e) => setNewService({ ...newService, phone: e.target.value })}
            placeholder="Digite o telefone"
            className="bg-white"
          />
        </div>

        <div className="grid gap-2">
          <label className="font-medium text-sm">Endereço *</label>
          <Input
            value={newService.address}
            onChange={(e) => setNewService({ ...newService, address: e.target.value })}
            placeholder="Digite o endereço completo"
            className="bg-white"
          />
          {/* Aqui será adicionado o componente do Google Maps */}
        </div>

        <div className="grid gap-2">
          <label className="font-medium text-sm">Intervalo de Horário</label>
          <Input
            value={newService.timeWindow}
            onChange={(e) => setNewService({ ...newService, timeWindow: e.target.value })}
            placeholder="Ex: 14:00 - 16:00"
            className="bg-white"
          />
        </div>

        <div className="grid gap-2">
          <label className="font-medium text-sm">Observação</label>
          <Textarea
            value={newService.notes}
            onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
            placeholder="Digite uma observação (opcional)"
            className="bg-white"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleAddService} className="bg-success hover:bg-success/90 text-white">
          Adicionar Serviço
        </Button>
      </div>
    </div>
  );
};