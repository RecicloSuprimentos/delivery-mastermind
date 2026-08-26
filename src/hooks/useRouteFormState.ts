import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Service } from "@/types/routes";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];
type LocationType = RouteInsert["start_location_type"];

export const useRouteFormState = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [startLocationType, setStartLocationType] = useState<LocationType>("operational_base");
  const [endLocationType, setEndLocationType] = useState<LocationType>("operational_base");
  const [selectedStartService, setSelectedStartService] = useState<string>();
  const [selectedEndService, setSelectedEndService] = useState<string>();
  const [routeName, setRouteName] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>();
  const [selectedStops, setSelectedStops] = useState<Service[]>([]);
  const [routeStats, setRouteStats] = useState<{ distance: number; duration: number } | null>(null);
  const [optimizedStops, setOptimizedStops] = useState<Service[]>([]);

  const handleRouteStats = (distance: number, duration: number) => {
    setRouteStats({ distance, duration });
  };

  const handleOptimizedStops = (stops: Service[]) => {
    setOptimizedStops(stops);
  };

  const handleOptimize = () => {
    if (optimizedStops.length > 0) {
      setSelectedStops(optimizedStops);
    }
  };

  const validateForm = () => {
    const hasStartService = startLocationType === "service" && !!selectedStartService;
    const hasEndService = endLocationType === "service" && !!selectedEndService;
    const hasMiddleStops = selectedStops.length > 0;
    
    const hasAnyService = hasStartService || hasEndService || hasMiddleStops;

    if (!date || !selectedAgent || !routeName || !hasAnyService) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios e garanta que haja pelo menos um serviço na rota.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    date,
    setDate,
    startLocationType,
    setStartLocationType,
    endLocationType,
    setEndLocationType,
    selectedStartService,
    setSelectedStartService,
    selectedEndService,
    setSelectedEndService,
    routeName,
    setRouteName,
    selectedAgent,
    setSelectedAgent,
    selectedStops,
    setSelectedStops,
    routeStats,
    optimizedStops,
    handleRouteStats,
    handleOptimizedStops,
    handleOptimize,
    validateForm,
  };
};