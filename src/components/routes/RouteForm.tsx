import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RouteFormHeader } from "./RouteFormHeader";
import { RouteFormContent } from "./RouteFormContent";
import { useRouteFormState } from "@/hooks/useRouteFormState";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

  // Estado para armazenar os serviços originais da rota
  const [originalStops, setOriginalStops] = useState<Service[]>([]);
  // Estado para armazenar o status da rota
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
