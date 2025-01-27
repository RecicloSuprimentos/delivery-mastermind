import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type ServiceFailureReason = {
  id: string;
  reason: string;
  is_other: boolean;
  is_active: boolean;
};

export function ServiceFailureReasons() {
  const { toast } = useToast();
  const [newReason, setNewReason] = useState("");

  const { data: reasons, refetch } = useQuery({
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

  const handleAddReason = async () => {
    if (!newReason.trim()) {
      toast({
        title: "Erro",
        description: "O motivo não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    if (newReason.length > 30) {
      toast({
        title: "Erro",
        description: "O motivo não pode ter mais que 30 caracteres",
        variant: "destructive",
      });
      return;
    }

    console.log("Attempting to add reason:", newReason);
    
    const { data: session } = await supabase.auth.getSession();
    console.log("Current session:", session);

    const { error } = await supabase.from("service_failure_reasons").insert([
      {
        reason: newReason,
        is_other: false,
      },
    ]);

    if (error) {
      console.error("Error adding reason:", error);
      toast({
        title: "Erro ao adicionar motivo",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Motivo adicionado com sucesso",
    });
    setNewReason("");
    refetch();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    console.log("Attempting to toggle status for id:", id);
    
    const { error } = await supabase
      .from("service_failure_reasons")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Error toggling status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Status atualizado com sucesso",
    });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Motivos de Insucesso</h2>
        <p className="text-muted-foreground">
          Gerencie os motivos predefinidos para serviços sem sucesso
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Novo motivo"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          maxLength={30}
          className="max-w-md"
        />
        <Button onClick={handleAddReason}>Adicionar</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Motivo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ativo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reasons?.map((reason) => (
            <TableRow key={reason.id}>
              <TableCell>{reason.reason}</TableCell>
              <TableCell>{reason.is_other ? "Outros" : "Predefinido"}</TableCell>
              <TableCell>
                <Switch
                  checked={reason.is_active}
                  onCheckedChange={() => toggleActive(reason.id, reason.is_active)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}