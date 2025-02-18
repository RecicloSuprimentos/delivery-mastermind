
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { RouteFormHeader } from "./RouteFormHeader";
import { RouteFormContent } from "./RouteFormContent";
import { useRouteFormState } from "@/hooks/useRouteFormState";
import { useRouteData } from "./form/useRouteData";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

interface RouteFormProps {
  onSave: (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => Promise<void>;
  isLoading: boolean;
  initialData?: RouteInsert | null;
}

export const RouteForm = ({ onSave, isLoading, initialData }: RouteFormProps) => {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isViewMode = mode === "view";
  const { toast } = useToast();

  const [originalStops, setOriginalStops] = useState<Service[]>([]);
  const [routeStatus, setRouteStatus] = useState<string>();

  const {
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
    handleRouteStats,
    handleOptimizedStops,
    handleOptimize,
    validateForm,
  } = useRouteFormState();

  const handleDataLoaded = useCallback(({ routeData, stops, status }) => {
    if (routeData) {
      setRouteName(routeData.name);
      setSelectedAgent(routeData.agent_id);
      setDate(new Date(routeData.start_time));
      setStartLocationType(routeData.start_location_type);
      setEndLocationType(routeData.end_location_type);
      setSelectedStartService(routeData.start_location_reference);
      setSelectedEndService(routeData.end_location_reference);
      setRouteStatus(status);
    }
    
    if (stops) {
      setSelectedStops(stops);
      setOriginalStops(stops);
    }
  }, [
    setRouteName,
    setSelectedAgent,
    setDate,
    setStartLocationType,
    setEndLocationType,
    setSelectedStartService,
    setSelectedEndService,
    setSelectedStops
  ]);

  const { agents, services, settings } = useRouteData({
    routeId,
    initialData,
    onDataLoaded: handleDataLoaded
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (routeStatus === "completed") {
      toast({
        title: "Operação não permitida",
        description: "Não é possível editar uma rota finalizada.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    const routeData: RouteInsert = {
      name: routeName,
      agent_id: selectedAgent!,
      start_time: date!.toISOString(),
      start_location_type: startLocationType,
      start_location_reference: startLocationType === "operational_base" ? 
        settings?.id : selectedStartService!,
      end_location_type: endLocationType,
      end_location_reference: endLocationType === "operational_base" ? 
        settings?.id : selectedEndService!,
      total_distance: routeStats?.distance,
      total_duration: routeStats?.duration,
      status: routeStatus || "assigned",
    };

    await onSave(routeData, selectedStops, routeId || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <RouteFormHeader
        onSave={handleSubmit}
        isLoading={isLoading}
        routeId={routeId}
        isViewMode={isViewMode}
        isCompleted={routeStatus === "completed"}
      />
      
      <RouteFormContent
        routeName={routeName}
        setRouteName={setRouteName}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        date={date}
        setDate={setDate}
        startLocationType={startLocationType}
        setStartLocationType={setStartLocationType}
        endLocationType={endLocationType}
        setEndLocationType={setEndLocationType}
        selectedStartService={selectedStartService}
        setSelectedStartService={setSelectedStartService}
        selectedEndService={selectedEndService}
        setSelectedEndService={setSelectedEndService}
        selectedStops={selectedStops}
        setSelectedStops={setSelectedStops}
        onOptimize={handleOptimize}
        onRouteStats={handleRouteStats}
        onOptimizedStops={handleOptimizedStops}
        agents={agents}
        services={services}
        settings={settings}
        isViewMode={isViewMode}
        routeStatus={routeStatus}
        originalStops={originalStops}
      />
    </form>
  );
};
