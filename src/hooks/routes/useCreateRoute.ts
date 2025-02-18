
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useRouteMutations } from "./useRouteMutations";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useCreateRoute = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { saveRoute } = useRouteMutations();

  const handleSave = async (routeData: RouteInsert, selectedStops: Service[]) => {
    console.log("Iniciando processo de criação da rota...", { routeData, selectedStops });
    setIsLoading(true);
    
    try {
      const stops = selectedStops.map(service => ({ service_id: service.id }));
      await saveRoute.mutateAsync({ routeData, stops });

      toast({
        title: "Sucesso",
        description: "Rota criada com sucesso!",
      });
      navigate("/routes");
    } catch (error) {
      console.error("Erro ao criar rota:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a rota. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSave,
    isLoading
  };
};
