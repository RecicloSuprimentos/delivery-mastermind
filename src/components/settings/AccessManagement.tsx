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
  user_metadata?: {
    name?: string;
    user_type?: string;
  };
}

export const AccessManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  const { data: users, refetch, isLoading } = useQuery({
    queryKey: ["authUsers"],
    queryFn: async () => {
      console.log('Fetching users...');
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "list" },
      });
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      console.log('Users fetched:', data);
      return data.users as AuthUser[];
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string;
      name?: string;
      user_type?: string;
    }) => {
      console.log('Creating user:', userData.email);
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "create", userData },
      });
      if (error) throw error;
      console.log('User created:', data);
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
    onError: (error) => {
      console.error('Error creating user:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o usuário",
        variant: "destructive",
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async (userData: { 
      id: string; 
      email?: string; 
      password?: string;
      name?: string;
      user_type?: string;
    }) => {
      console.log('Updating user:', userData.id);
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "update", userData },
      });
      if (error) throw error;
      console.log('User updated:', data);
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
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o usuário",
        variant: "destructive",
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      const { data, error } = await supabase.functions.invoke("manage-auth-users", {
        body: { action: "delete", userData: { id: userId } },
      });
      if (error) throw error;
      console.log('User deleted:', data);
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao remover o usuário",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (formData: { 
    email: string; 
    password?: string;
    name?: string;
    user_type?: string;
  }) => {
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
      await createUser.mutateAsync(formData as { 
        email: string; 
        password: string;
        name?: string;
        user_type?: string;
      });
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

      {isLoading ? (
        <div>Carregando usuários...</div>
      ) : (
        <AccessUserList
          users={filteredUsers || []}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      <AccessUserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        selectedUser={selectedUser}
        onSubmit={handleSubmit}
      />
    </div>
  );
};