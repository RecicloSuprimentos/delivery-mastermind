
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { RouteForm } from "./RouteForm";
import { useRouteMutations } from "@/hooks/routes/useRouteMutations";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const RouteFormContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { saveRoute } = useRouteMutations();

  const handleSave = async (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => {
    console.log("Iniciando processo de salvamento da rota...", { routeData, selectedStops, routeId });
    setIsLoading(true);
    
    try {
      const stops = selectedStops.map(service => ({ service_id: service.id }));
      await saveRoute.mutateAsync({ routeData, stops });

      toast({
        title: "Sucesso",
        description: routeId ? "Rota atualizada com sucesso!" : "Rota criada com sucesso!",
      });
      navigate("/routes");
    } catch (error) {
      console.error("Erro ao salvar rota:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a rota. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <RouteForm onSave={handleSave} isLoading={isLoading} />;
};
