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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type UserType = Database["public"]["Enums"]["user_type"];

interface User {
  id: string;
  name: string;
  email: string;
  user_type: UserType;
  is_active: boolean;
  password?: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  onSubmit: (formData: Omit<User, "id">) => void;
}

export const UserForm = ({ isOpen, onClose, selectedUser, onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<Omit<User, "id">>({
    name: "",
    email: "",
    user_type: "user",
    is_active: true,
    password: "",
  });

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        user_type: selectedUser.user_type,
        is_active: selectedUser.is_active,
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        user_type: "user",
        is_active: true,
        password: "",
      });
    }
  }, [selectedUser]);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
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
            <Label htmlFor="type">Tipo de Usuário</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value: UserType) =>
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
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="status">Status</Label>
            <Switch
              id="status"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};