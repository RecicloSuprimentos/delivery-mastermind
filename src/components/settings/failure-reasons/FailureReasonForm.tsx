import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FailureReasonFormProps {
  onSubmit: (reason: string) => Promise<void>;
  initialValue?: string;
  buttonLabel?: string;
}

export function FailureReasonForm({ onSubmit, initialValue = "", buttonLabel = "Adicionar" }: FailureReasonFormProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState(initialValue);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Erro",
        description: "O motivo não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    if (reason.length > 30) {
      toast({
        title: "Erro",
        description: "O motivo não pode ter mais que 30 caracteres",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(reason);
    if (!initialValue) setReason("");
  };

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Novo motivo"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={30}
        className="max-w-md"
      />
      <Button onClick={handleSubmit}>{buttonLabel}</Button>
    </div>
  );
}