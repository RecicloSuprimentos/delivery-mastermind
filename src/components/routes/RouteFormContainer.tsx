import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { RouteForm } from "./RouteForm";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";
import { supabase } from "@/integrations/supabase/client";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

interface RouteFormProps {
  onSave: (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => Promise<void>;
  isLoading: boolean;
}

export const RouteFormContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => {
    setIsLoading(true);
    try {
      let route;
      if (routeId) {
        const { data: updatedRoute, error: routeError } = await supabase
          .from("routes")
          .update(routeData)
          .eq("id", routeId)
          .select()
          .single();

        if (routeError) throw routeError;
        route = updatedRoute;

        await supabase
          .from("route_stops")
          .delete()
          .eq("route_id", routeId);
      } else {
        const { data: newRoute, error: routeError } = await supabase
          .from("routes")
          .insert(routeData)
          .select()
          .single();

        if (routeError) throw routeError;
        route = newRoute;
      }

      const stops = selectedStops.map((service, index) => ({
        route_id: route.id,
        service_id: service.id,
        sequence_number: index + 1,
      }));

      const { error: stopsError } = await supabase
        .from("route_stops")
        .insert(stops);

      if (stopsError) throw stopsError;

      const { error: updateError } = await supabase
        .from("services")
        .update({ status: "assigned" })
        .in("id", selectedStops.map(s => s.id));

      if (updateError) throw updateError;

      toast({
        title: routeId ? "Rota atualizada com sucesso!" : "Rota criada com sucesso!",
        description: "A rota foi salva e está pronta para ser utilizada.",
      });
      navigate("/routes");
    } catch (error) {
      console.error("Erro ao salvar rota:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a rota.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <RouteForm onSave={handleSave} isLoading={isLoading} />;
};