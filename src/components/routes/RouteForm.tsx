
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
}

export const RouteForm = ({ onSave, isLoading }: RouteFormProps) => {
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

  const { agents, services, settings } = useRouteData();

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
      />
    </form>
  );
};
