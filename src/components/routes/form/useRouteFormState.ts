import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Service } from "@/types/routes";

export const useRouteFormState = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [startLocationType, setStartLocationType] = useState<"operational_base" | "service">("operational_base");
  const [endLocationType, setEndLocationType] = useState<"operational_base" | "service">("operational_base");
  const [selectedStartService, setSelectedStartService] = useState<string>();
  const [selectedEndService, setSelectedEndService] = useState<string>();
  const [routeName, setRouteName] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>();
  const [selectedStops, setSelectedStops] = useState<Service[]>([]);
  const [routeStats, setRouteStats] = useState<{ distance: number; duration: number } | null>(null);
  const [shouldOptimize, setShouldOptimize] = useState(false);

  const handleRouteStats = (distance: number, duration: number) => {
    setRouteStats({ distance, duration });
  };

  const handleOptimizedStops = (stops: Service[]) => {
    setSelectedStops(stops);
  };

  const handleOptimize = () => {
    setShouldOptimize(true);
  };

  const resetOptimization = () => {
    setShouldOptimize(false);
  };

  const validateForm = () => {
    if (!date || !selectedAgent || !routeName || selectedStops.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
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
    shouldOptimize,
    handleRouteStats,
    handleOptimizedStops,
    handleOptimize,
    resetOptimization,
    validateForm,
  };
};