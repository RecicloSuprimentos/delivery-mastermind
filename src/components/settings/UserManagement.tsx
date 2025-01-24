import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UserForm } from "./UserForm";
import { UserList } from "./UserList";
import type { Database } from "@/integrations/supabase/types";

type UserType = Database["public"]["Enums"]["user_type"];

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  user_type: UserType;
  is_active: boolean;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Consulta de usuários com tratamento de erro
  const { data: users, error: queryError } = useQuery({
    queryKey: ["systemUsers"],
    queryFn: async () => {
      console.log("Buscando usuários do sistema...");
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        throw new Error("Não foi possível carregar a lista de usuários");
      }

      console.log("Usuários encontrados:", data);
      return data;
    },
  });

  // Mutação para criar usuário com tratamento de erro
  const createUser = useMutation({
    mutationFn: async (userData: Omit<User, "id">) => {
      console.log("Criando novo usuário:", userData);
      const { error } = await supabase.from("system_users").insert([userData]);
      if (error) {
        console.error("Erro ao criar usuário:", error);
        if (error.code === "23505") {
          throw new Error("Já existe um usuário com este e-mail");
        }
        throw new Error("Não foi possível criar o usuário");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
      toast({
        title: "Usuário criado com sucesso!",
        description: "O novo usuário foi adicionado ao sistema.",
      });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message,
      });
    },
  });

  // Mutação para atualizar usuário com tratamento de erro
  const updateUser = useMutation({
    mutationFn: async (user: User) => {
      console.log("Atualizando usuário:", user);
      const { error } = await supabase
        .from("system_users")
        .update({
          name: user.name,
          email: user.email,
          password: user.password,
          user_type: user.user_type,
          is_active: user.is_active,
        })
        .eq("id", user.id);
      
      if (error) {
        console.error("Erro ao atualizar usuário:", error);
        if (error.code === "23505") {
          throw new Error("Já existe um usuário com este e-mail");
        }
        throw new Error("Não foi possível atualizar o usuário");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
      toast({
        title: "Usuário atualizado!",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error.message,
      });
    },
  });

  // Mutação para deletar usuário com tratamento de erro
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      console.log("Deletando usuário:", userId);
      const { error } = await supabase
        .from("system_users")
        .delete()
        .eq("id", userId);
      
      if (error) {
        console.error("Erro ao deletar usuário:", error);
        throw new Error("Não foi possível remover o usuário");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover usuário",
        description: error.message,
      });
    },
  });

  // Se houver erro na consulta, exibe mensagem
  if (queryError) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Não foi possível carregar a lista de usuários",
    });
  }

  const handleSubmit = async (formData: Omit<User, "id">) => {
    if (selectedUser) {
      await updateUser.mutateAsync({
        ...selectedUser,
        ...formData,
      });
    } else {
      await createUser.mutateAsync(formData);
    }
  };

  const handleEditUser = (user: User) => {
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

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      <UserList
        users={filteredUsers || []}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <UserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        selectedUser={selectedUser}
        onSubmit={handleSubmit}
      />
    </div>
  );
};