
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { RouteForm } from "./RouteForm";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";
import { supabase } from "@/integrations/supabase/client";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const RouteFormContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => {
    console.log("Starting route save process...", { routeData, selectedStops, routeId });
    setIsLoading(true);
    try {
      let route;
      if (routeId) {
        console.log("Updating existing route...");
        const { data: existingRoute } = await supabase
          .from("routes")
          .select("status")
          .eq("id", routeId)
          .single();

        const { data: updatedRoute, error: routeError } = await supabase
          .from("routes")
          .update({
            ...routeData,
            status: existingRoute?.status || 'assigned' // Mantém o status original
          })
          .eq("id", routeId)
          .select()
          .single();

        if (routeError) {
          console.error("Error updating route:", routeError);
          throw routeError;
        }
        route = updatedRoute;
        console.log("Route updated successfully:", route);

        // Obtém os serviços atuais da rota
        const { data: currentStops } = await supabase
          .from("route_stops")
          .select("service_id")
          .eq("route_id", routeId);

        const currentServiceIds = currentStops?.map(stop => stop.service_id) || [];
        const newServiceIds = selectedStops.map(service => service.id);

        // Identifica serviços removidos
        const removedServiceIds = currentServiceIds.filter(
          id => !newServiceIds.includes(id)
        );

        // Atualiza status dos serviços removidos para "not-assigned"
        if (removedServiceIds.length > 0) {
          const { error: updateError } = await supabase
            .from("services")
            .update({ status: "not-assigned", assigned_to: null })
            .in("id", removedServiceIds);

          if (updateError) {
            console.error("Error updating removed services:", updateError);
            throw updateError;
          }
        }

        console.log("Deleting existing route stops...");
        const { error: deleteError } = await supabase
          .from("route_stops")
          .delete()
          .eq("route_id", routeId);

        if (deleteError) {
          console.error("Error deleting route stops:", deleteError);
          throw deleteError;
        }
      } else {
        console.log("Creating new route...");
        const { data: newRoute, error: routeError } = await supabase
          .from("routes")
          .insert(routeData)
          .select()
          .single();

        if (routeError) {
          console.error("Error creating route:", routeError);
          throw routeError;
        }
        route = newRoute;
        console.log("New route created successfully:", route);
      }

      console.log("Preparing route stops data...");
      const stops = selectedStops.map((service, index) => ({
        route_id: route.id,
        service_id: service.id,
        sequence_number: index + 1,
      }));

      console.log("Inserting route stops...");
      const { error: stopsError } = await supabase
        .from("route_stops")
        .insert(stops);

      if (stopsError) {
        console.error("Error inserting route stops:", stopsError);
        throw stopsError;
      }

      console.log("Updating services status...");
      const { error: updateError } = await supabase
        .from("services")
        .update({ status: "assigned" })
        .in("id", selectedStops.map(s => s.id));

      if (updateError) {
        console.error("Error updating services status:", updateError);
        throw updateError;
      }

      console.log("Route save process completed successfully");
      toast({
        title: routeId ? "Rota atualizada com sucesso!" : "Rota criada com sucesso!",
        description: "A rota foi salva e está pronta para ser utilizada.",
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
