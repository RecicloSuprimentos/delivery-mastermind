
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useRouteMutations } from "./useRouteMutations";
import { useRoutes } from "@/hooks/useRoutes";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useEditRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { saveRoute } = useRouteMutations(id);
  const { route } = useRoutes(id);

  const handleSave = async (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => {
    console.log("Iniciando processo de edição da rota...", { routeData, selectedStops, id });
    setIsLoading(true);
    
    try {
      const stops = selectedStops.map(service => ({ service_id: service.id }));
      await saveRoute.mutateAsync({ routeData, stops });

      toast({
        title: "Sucesso",
        description: "Rota atualizada com sucesso!",
      });
      navigate("/routes");
    } catch (error) {
      console.error("Erro ao editar rota:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao editar a rota. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSave,
    isLoading,
    route
  };
};
