import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthUser {
  email: string;
}

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; user_type: string }) => void;
  availableUsers: AuthUser[];
}

export const AssignmentForm = ({
  isOpen,
  onClose,
  onSubmit,
  availableUsers,
}: AssignmentFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    user_type: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    user_type: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      user_type: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório";
    }

    if (!formData.user_type) {
      newErrors.user_type = "Tipo de usuário é obrigatório";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Atribuição</DialogTitle>
          <DialogDescription>
            Atribua um nome e tipo para o usuário selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Select
              value={formData.email}
              onValueChange={(value) =>
                setFormData({ ...formData, email: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.email} value={user.email}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Usuário</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) =>
                setFormData({ ...formData, user_type: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="agent">Agente</SelectItem>
              </SelectContent>
            </Select>
            {errors.user_type && (
              <span className="text-sm text-red-500">{errors.user_type}</span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};