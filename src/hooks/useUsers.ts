import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  user_type: "admin" | "user" | "agent";
  is_active: boolean;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Profile> }) => {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    },
  });

  const createUser = useMutation({
    mutationFn: async ({ email, password, data }: { email: string; password: string; data: Omit<Profile, "id"> }) => {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("No user returned from signup");

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          ...data,
        });

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Usuário criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error("Erro ao criar usuário");
    },
  });

  return {
    profiles,
    isLoading,
    updateUser,
    createUser,
  };
};