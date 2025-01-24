import { useState, useEffect } from "react";
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
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    user_type?: "user" | "agent" | "admin";
  };
}

interface AccessUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: AuthUser | null;
  onSubmit: (formData: { 
    email: string; 
    password?: string;
    name?: string;
    user_type?: "user" | "agent" | "admin";
  }) => void;
}

export const AccessUserForm = ({
  isOpen,
  onClose,
  selectedUser,
  onSubmit,
}: AccessUserFormProps) => {
  const [formData, setFormData] = useState<{
    email: string;
    password?: string;
    name: string;
    user_type: "user" | "agent" | "admin";
  }>({
    email: "",
    password: "",
    name: "",
    user_type: "user",
  });

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        email: selectedUser.email,
        password: "",
        name: selectedUser.user_metadata?.name || "",
        user_type: selectedUser.user_metadata?.user_type || "user",
      });
    } else {
      setFormData({
        email: "",
        password: "",
        name: "",
        user_type: "user",
      });
    }
  }, [selectedUser]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedUser ? "Editar Usuário" : "Criar Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {selectedUser
              ? "Edite os dados do usuário."
              : "Preencha os dados do novo usuário do sistema."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              {selectedUser ? "Nova Senha (deixe em branco para manter)" : "Senha"}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user_type">Tipo de Usuário</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value: "user" | "agent" | "admin") =>
                setFormData({ ...formData, user_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="agent">Agente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};