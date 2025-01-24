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

interface AuthUser {
  id: string;
  email: string;
}

interface AccessUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: AuthUser | null;
  onSubmit: (formData: { email: string; password?: string }) => void;
}

export const AccessUserForm = ({
  isOpen,
  onClose,
  selectedUser,
  onSubmit,
}: AccessUserFormProps) => {
  const [formData, setFormData] = useState<{ email: string; password?: string }>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        email: selectedUser.email,
        password: "",
      });
    } else {
      setFormData({
        email: "",
        password: "",
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
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};