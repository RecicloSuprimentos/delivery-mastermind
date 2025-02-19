
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

export const useRouteBasicMutations = (routeId?: string) => {
  const queryClient = useQueryClient();

  const updateRouteData = async (routeData: RouteInsert) => {
    const { data: updatedRoute, error } = await supabase
      .from("routes")
      .update({
        name: routeData.name,
        agent_id: routeData.agent_id,
        start_time: routeData.start_time,
        start_location_type: routeData.start_location_type,
        start_location_reference: routeData.start_location_reference,
        end_location_type: routeData.end_location_type,
        end_location_reference: routeData.end_location_reference,
        total_distance: routeData.total_distance,
        total_duration: routeData.total_duration,
      })
      .eq("id", routeId)
      .select()
      .single();

    if (error) throw error;
    return updatedRoute;
  };

  const createNewRoute = async (routeData: RouteInsert) => {
    const { data, error } = await supabase
      .from("routes")
      .insert({ ...routeData, status: 'assigned' })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    updateRouteData,
    createNewRoute,
  };
};
