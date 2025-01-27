import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethodForm } from "./payment-methods/PaymentMethodForm";
import { PaymentMethodList } from "./payment-methods/PaymentMethodList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
}

export function PaymentMethods() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const { data: paymentMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching payment methods:", error);
        throw error;
      }
      return data as PaymentMethod[];
    },
  });

  const addPaymentMethod = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("payment_methods")
        .insert([{ name }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Sucesso",
        description: "Forma de pagamento adicionada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error adding payment method:", error);
      toast({
        title: "Erro ao adicionar forma de pagamento",
        description: "Ocorreu um erro ao adicionar a forma de pagamento",
        variant: "destructive",
      });
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      const { error } = await supabase
        .from("payment_methods")
        .update({ name: data.name })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      setEditingMethod(null);
      toast({
        title: "Sucesso",
        description: "Forma de pagamento atualizada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error updating payment method:", error);
      toast({
        title: "Erro ao atualizar forma de pagamento",
        description: "Ocorreu um erro ao atualizar a forma de pagamento",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Sucesso",
        description: "Forma de pagamento excluída com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Erro ao excluir forma de pagamento",
        description: "Ocorreu um erro ao excluir a forma de pagamento",
        variant: "destructive",
      });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_active: !status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error toggling status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Formas de Pagamento</h2>
        <p className="text-muted-foreground">
          Gerencie as formas de pagamento disponíveis no sistema
        </p>
      </div>

      <PaymentMethodForm onSubmit={(name) => addPaymentMethod.mutateAsync(name)} />

      <PaymentMethodList
        paymentMethods={paymentMethods || []}
        onToggleActive={(id, currentStatus) => 
          toggleActive.mutateAsync({ id, status: currentStatus })
        }
        onEdit={setEditingMethod}
        onDelete={(id) => deletePaymentMethod.mutateAsync(id)}
      />

      <Dialog open={!!editingMethod} onOpenChange={() => setEditingMethod(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Forma de Pagamento</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm
            initialValue={editingMethod?.name}
            buttonLabel="Salvar"
            onSubmit={async (name) => {
              if (editingMethod) {
                await updatePaymentMethod.mutateAsync({
                  id: editingMethod.id,
                  name,
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}