import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RouteFormHeader } from "./RouteFormHeader";
import { RouteFormContent } from "./RouteFormContent";
import { useRouteFormState } from "./form/useRouteFormState";
import { useRouteValidation } from "./form/useRouteValidation";
import { useRouteFormQueries } from "./form/RouteFormQueries";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];

interface RouteFormProps {
  onSave: (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => Promise<void>;
  isLoading: boolean;
}

export const RouteForm = ({ onSave, isLoading }: RouteFormProps) => {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isViewMode = mode === "view";

  const { handleRouteValidation, handleStopsValidation } = useRouteValidation();
  const { agents, services, settings } = useRouteFormQueries();

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

  const [routeStatus, setRouteStatus] = useState<string>();
  const [originalStops, setOriginalStops] = useState<Service[]>([]);

  useEffect(() => {
    if (routeId) {
      const fetchRoute = async () => {
        const { data: routeData, error: routeError } = await supabase
          .from("routes")
          .select("*")
          .eq("id", routeId)
          .single();

        if (routeError) {
          console.error("Error fetching route:", routeError);
          return;
        }

        if (routeData) {
          setRouteName(routeData.name);
          setSelectedAgent(routeData.agent_id);
          setDate(new Date(routeData.start_time));
          setStartLocationType(routeData.start_location_type);
          setEndLocationType(routeData.end_location_type);
          setSelectedStartService(routeData.start_location_reference);
          setSelectedEndService(routeData.end_location_reference);
          setRouteStatus(routeData.status);
          
          const { data: stopsData } = await supabase
            .from("route_stops")
            .select("*, service:services(*)")
            .eq("route_id", routeId)
            .order("sequence_number");

          if (stopsData) {
            const stops = stopsData.map((stop: any) => stop.service);
            setSelectedStops(stops);
            setOriginalStops(stops);
          }
        }
      };

      fetchRoute();
    }
  }, [routeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!handleRouteValidation(routeStatus)) return;
    if (!handleStopsValidation(selectedStops, originalStops, routeStatus)) return;
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