import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FailureReasonForm } from "./failure-reasons/FailureReasonForm";
import { FailureReasonList } from "./failure-reasons/FailureReasonList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ServiceFailureReason } from "@/types/routes";

export function ServiceFailureReasons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingReason, setEditingReason] = useState<ServiceFailureReason | null>(null);

  const { data: reasons } = useQuery({
    queryKey: ["serviceFailureReasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_failure_reasons")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching reasons:", error);
        throw error;
      }
      return data as ServiceFailureReason[];
    },
  });

  const addReason = useMutation({
    mutationFn: async (reason: string) => {
      const { error } = await supabase
        .from("service_failure_reasons")
        .insert([{ reason, is_other: false }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceFailureReasons"] });
      toast({
        title: "Sucesso",
        description: "Motivo adicionado com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error adding reason:", error);
      toast({
        title: "Erro ao adicionar motivo",
        description: "Ocorreu um erro ao adicionar o motivo",
        variant: "destructive",
      });
    },
  });

  const updateReason = useMutation({
    mutationFn: async (data: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("service_failure_reasons")
        .update({ reason: data.reason })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceFailureReasons"] });
      setEditingReason(null);
      toast({
        title: "Sucesso",
        description: "Motivo atualizado com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error updating reason:", error);
      toast({
        title: "Erro ao atualizar motivo",
        description: "Ocorreu um erro ao atualizar o motivo",
        variant: "destructive",
      });
    },
  });

  const deleteReason = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_failure_reasons")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceFailureReasons"] });
      toast({
        title: "Sucesso",
        description: "Motivo excluído com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error deleting reason:", error);
      toast({
        title: "Erro ao excluir motivo",
        description: "Ocorreu um erro ao excluir o motivo",
        variant: "destructive",
      });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase
        .from("service_failure_reasons")
        .update({ is_active: !status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceFailureReasons"] });
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
        <h2 className="text-2xl font-bold">Motivos de Insucesso</h2>
        <p className="text-muted-foreground">
          Gerencie os motivos predefinidos para serviços sem sucesso
        </p>
      </div>

      <FailureReasonForm onSubmit={(reason) => addReason.mutateAsync(reason)} />

      <FailureReasonList
        reasons={reasons || []}
        onToggleActive={(id, currentStatus) => 
          toggleActive.mutateAsync({ id, status: currentStatus })
        }
        onEdit={setEditingReason}
        onDelete={(id) => deleteReason.mutateAsync(id)}
      />

      <Dialog open={!!editingReason} onOpenChange={() => setEditingReason(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Motivo</DialogTitle>
          </DialogHeader>
          <FailureReasonForm
            initialValue={editingReason?.reason}
            buttonLabel="Salvar"
            onSubmit={async (reason) => {
              if (editingReason) {
                await updateReason.mutateAsync({
                  id: editingReason.id,
                  reason,
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}