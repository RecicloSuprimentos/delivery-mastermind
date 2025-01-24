import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AccessUserForm } from "./AccessUserForm";
import { AccessUserList } from "./AccessUserList";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
}

export const AccessManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  const { data: users, refetch } = useQuery({
    queryKey: ["authUsers"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      return data.users as AuthUser[];
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: { email: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "create", userData },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Usuário criado com sucesso!",
        description: "O novo usuário foi adicionado ao sistema.",
      });
      setIsFormOpen(false);
    },
  });

  const updateUser = useMutation({
    mutationFn: async (userData: { id: string; email?: string; password?: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "update", userData },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Usuário atualizado!",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });
      setIsFormOpen(false);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "delete", userData: { id: userId } },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    },
  });

  const handleSubmit = async (formData: { email: string; password?: string }) => {
    if (selectedUser) {
      await updateUser.mutateAsync({
        id: selectedUser.id,
        ...formData,
      });
    } else {
      if (!formData.password) {
        toast({
          title: "Erro",
          description: "A senha é obrigatória para novos usuários.",
          variant: "destructive",
        });
        return;
      }
      await createUser.mutateAsync(formData as { email: string; password: string });
    }
  };

  const handleEditUser = (user: AuthUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await deleteUser.mutateAsync(userId);
    }
  };

  const handleOpenForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users?.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar usuários..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button className="gap-2" onClick={handleOpenForm}>
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <AccessUserList
        users={filteredUsers || []}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <AccessUserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        selectedUser={selectedUser}
        onSubmit={handleSubmit}
      />
    </div>
  );
};