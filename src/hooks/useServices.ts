import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "not-assigned");

      if (error) throw error;
      return data;
    },
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir serviço",
        variant: "destructive",
      });
    },
  });

  const updateServiceStatus = useMutation({
    mutationFn: async ({ serviceId, status }: { serviceId: string; status: string }) => {
      const { error } = await supabase
        .from("services")
        .update({ status })
        .eq("id", serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Sucesso",
        description: "Status do serviço atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do serviço",
        variant: "destructive",
      });
    },
  });

  return {
    services,
    isLoading,
    deleteService,
    updateServiceStatus,
  };
};