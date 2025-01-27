import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodFormProps {
  onSubmit: (name: string) => Promise<void>;
  initialValue?: string;
  buttonLabel?: string;
}

export function PaymentMethodForm({ onSubmit, initialValue = "", buttonLabel = "Adicionar" }: PaymentMethodFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialValue);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    if (name.length > 30) {
      toast({
        title: "Erro",
        description: "O nome não pode ter mais que 30 caracteres",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(name);
    if (!initialValue) setName("");
  };

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Nova forma de pagamento"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={30}
        className="max-w-md"
      />
      <Button onClick={handleSubmit}>{buttonLabel}</Button>
    </div>
  );
}