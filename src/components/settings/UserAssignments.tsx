import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AssignmentForm } from "./AssignmentForm";
import { AssignmentsList } from "./AssignmentsList";

interface AuthUser {
  email: string;
}

export const UserAssignments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: availableUsers } = useQuery({
    queryKey: ["availableUsers"],
    queryFn: async () => {
      console.log("Buscando usuários disponíveis...");
      const { data, error } = await supabase.functions.invoke("list-auth-users");
      
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        throw new Error("Não foi possível carregar a lista de usuários");
      }

      console.log("Usuários encontrados:", data);
      return data.users as AuthUser[];
    },
  });

  const { data: assignedUsers } = useQuery({
    queryKey: ["assignedUsers"],
    queryFn: async () => {
      console.log("Buscando usuários atribuídos...");
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar usuários atribuídos:", error);
        throw new Error("Não foi possível carregar a lista de usuários atribuídos");
      }

      console.log("Usuários atribuídos encontrados:", data);
      return data;
    },
  });

  const createAssignment = useMutation({
    mutationFn: async (userData: { name: string; email: string; user_type: string }) => {
      console.log("Criando nova atribuição:", userData);
      const { data, error } = await supabase
        .from("system_users")
        .insert([userData])
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao criar atribuição:", error);
        throw new Error(error.message || "Não foi possível criar a atribuição");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableUsers"] });
      queryClient.invalidateQueries({ queryKey: ["assignedUsers"] });
      toast({
        title: "Atribuição criada com sucesso!",
        description: "O usuário foi atribuído ao sistema.",
      });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      console.error("Erro na mutação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar atribuição",
        description: error.message,
      });
    },
  });

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Atribuições de Usuário</h2>
        <Button className="gap-2" onClick={handleOpenForm}>
          <UserPlus className="h-4 w-4" />
          Nova Atribuição
        </Button>
      </div>

      <AssignmentsList users={assignedUsers || []} />

      <AssignmentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={createAssignment.mutate}
        availableUsers={availableUsers || []}
      />
    </div>
  );
};