import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UserList } from "@/components/settings/UserList";
import { UserForm } from "@/components/settings/UserForm";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type UserType = Database["public"]["Enums"]["user_type"];

interface User {
  id: string;
  name: string;
  email: string;
  user_type: UserType;
  is_active: boolean;
}

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { profiles, isLoading, updateUser, createUser } = useUsers();

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: { is_active: false },
      });
      toast.success("Usuário desativado com sucesso");
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast.error("Erro ao desativar usuário");
    }
  };

  const handleSubmit = async (formData: User & { password?: string }) => {
    try {
      if (selectedUser) {
        await updateUser.mutateAsync({
          id: selectedUser.id,
          data: formData,
        });
        toast.success("Usuário atualizado com sucesso");
      } else {
        if (!formData.password) {
          toast.error("Senha é obrigatória para novos usuários");
          return;
        }
        await createUser.mutateAsync({
          email: formData.email,
          password: formData.password,
          data: {
            name: formData.name,
            user_type: formData.user_type,
            is_active: formData.is_active,
          },
        });
        toast.success("Usuário criado com sucesso");
      }
      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Erro ao salvar usuário");
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const users: User[] = profiles?.map(profile => ({
    id: profile.id,
    name: profile.name || "",
    email: "", // This will be filled from auth.users
    user_type: profile.user_type as UserType,
    is_active: profile.is_active || false
  })) || [];

  return (
    <div className="container mx-auto p-6 space-y-6 pt-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Novo Usuário
        </button>
      </div>

      <UserList
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Index;