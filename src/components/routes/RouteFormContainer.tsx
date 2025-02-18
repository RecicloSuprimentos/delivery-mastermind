
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { RouteForm } from "./RouteForm";
import { useRouteMutations } from "@/hooks/routes/useRouteMutations";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";
import { supabase } from "@/integrations/supabase/client";

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
      let route;
      
      if (routeId) {
        // Atualização: primeiro deletar as paradas existentes
        console.log("Deletando paradas existentes...");
        const { error: deleteError } = await supabase
          .from("route_stops")
          .delete()
          .eq("route_id", routeId);

        if (deleteError) {
          console.error("Erro ao deletar paradas:", deleteError);
          throw deleteError;
        }

        // Depois atualizar a rota
        const routeResult = await saveRoute.mutateAsync(routeData);
        route = routeResult;
        console.log("Rota atualizada com sucesso:", route);
      } else {
        // Criação: salvar nova rota
        const routeResult = await saveRoute.mutateAsync(routeData);
        route = routeResult;
        console.log("Nova rota criada com sucesso:", route);
      }

      // Inserir as novas paradas
      console.log("Preparando dados das paradas...");
      const stops = selectedStops.map((service, index) => ({
        route_id: route.id,
        service_id: service.id,
        sequence_number: index + 1,
      }));

      console.log("Inserindo paradas...");
      const { error: stopsError } = await supabase
        .from("route_stops")
        .insert(stops);

      if (stopsError) {
        console.error("Erro ao inserir paradas:", stopsError);
        throw stopsError;
      }

      // Atualizar status dos serviços
      console.log("Atualizando status dos serviços...");
      const { error: updateError } = await supabase
        .from("services")
        .update({ status: "assigned" })
        .in("id", selectedStops.map(s => s.id));

      if (updateError) {
        console.error("Erro ao atualizar status dos serviços:", updateError);
        throw updateError;
      }

      console.log("Processo de salvamento concluído com sucesso");
      toast({
        title: "Sucesso",
        description: routeId ? "Rota atualizada com sucesso!" : "Rota criada com sucesso!",
      });
      navigate("/routes");
    } catch (error) {
      console.error("Erro detalhado ao salvar rota:", error);
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
