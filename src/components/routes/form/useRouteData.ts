
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Service } from "@/types/routes";

export const useRouteData = () => {
  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("user_type", "agent");

      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["available_services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "not-assigned");

      if (error) throw error;
      return data as Service[];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["system_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return {
    agents,
    services,
    settings
  };
};
