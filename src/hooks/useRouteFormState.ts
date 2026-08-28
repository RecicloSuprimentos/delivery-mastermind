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
    if (!routeName?.trim()) {
      toast({
        title: "Nome da rota ausente",
        description: "Por favor, defina um nome ou turno para a rota antes de salvar.",
        variant: "destructive",
      });
      return false;
    }

    if (!date) {
      toast({
        title: "Data não informada",
        description: "Selecione a data em que a rota será executada.",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedAgent) {
      toast({
        title: "Motorista ausente",
        description: "Selecione o agente/motorista responsável por realizar esta rota.",
        variant: "destructive",
      });
      return false;
    }

    if (startLocationType === "service" && !selectedStartService) {
      toast({
        title: "Local de Início incompleto",
        description: "Você marcou o início como 'Serviço', mas não escolheu qual é. Selecione-o na lista.",
        variant: "destructive",
      });
      return false;
    }

    if (endLocationType === "service" && !selectedEndService) {
      toast({
        title: "Local de Término incompleto",
        description: "Você marcou o término como 'Serviço', mas não escolheu qual é. Selecione-o na lista.",
        variant: "destructive",
      });
      return false;
    }

    const hasStartService = startLocationType === "service" && !!selectedStartService;
    const hasEndService = endLocationType === "service" && !!selectedEndService;
    const hasMiddleStops = selectedStops.length > 0;
    
    const hasAnyService = hasStartService || hasEndService || hasMiddleStops;

    if (!hasAnyService) {
      toast({
        title: "Rota vazia",
        description: "Sua rota não possui nenhuma parada. Adicione pelo menos um serviço (seja no Início, Meio ou Fim) para salvá-la.",
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