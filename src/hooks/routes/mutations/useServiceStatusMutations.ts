
import { supabase } from "@/integrations/supabase/client";
import type { ValidStatus } from "@/types/services";

export const useServiceStatusMutations = () => {
  const updateServicesStatus = async (serviceIds: string[], status: ValidStatus) => {
    const { error } = await supabase
      .from("services")
      .update({ status })
      .in("id", serviceIds);

    if (error) throw error;
  };

  return {
    updateServicesStatus,
  };
};
