import { useEffect, useRef } from "react";
import { RouteFormHeader } from "./RouteFormHeader";
import { RouteFormContent } from "./RouteFormContent";
import { useRouteFormState } from "@/hooks/useRouteFormState";
import { useRouteData } from "./form/useRouteData";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

interface RouteFormProps {
  onSave: (routeData: RouteInsert, selectedStops: Service[]) => Promise<void>;
  isLoading: boolean;
  routeId?: string;
  initialData?: any;
  isViewMode?: boolean;
}

export const RouteForm = ({ onSave, isLoading, routeId, initialData, isViewMode }: RouteFormProps) => {
  const initializedRef = useRef(false);

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

  // Passa o routeId para que useRouteData inclua os servicos ja vinculados a rota na lista
  const { agents, services, settings } = useRouteData(routeId);

  // Carregar dados iniciais quando estiver em modo de edicao
  useEffect(() => {
    if (initialData && !initializedRef.current) {
      initializedRef.current = true;
      setRouteName(initialData.name);
      setSelectedAgent(initialData.agent_id);
      setDate(new Date(initialData.start_time));
      setStartLocationType(initialData.start_location_type);
      setEndLocationType(initialData.end_location_type);
      
      if (initialData.start_location_type === "service") {
        setSelectedStartService(initialData.start_location_reference);
      }
      
      if (initialData.end_location_type === "service") {
        setSelectedEndService(initialData.end_location_reference);
      }

      // Carregar paradas intermediarias se disponiveis
      if (initialData.route_stops?.length > 0) {
        const stops = initialData.route_stops.map((stop: any) => stop.service);
        setSelectedStops(stops.filter(Boolean));
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      status: "assigned",
    };

    await onSave(routeData, selectedStops);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <RouteFormHeader
        onSave={handleSubmit}
        isLoading={isLoading}
        routeId={routeId}
        isViewMode={isViewMode}
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
      />
    </form>
  );
};
