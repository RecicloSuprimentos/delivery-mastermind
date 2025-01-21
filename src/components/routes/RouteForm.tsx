import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { RouteMap } from "./RouteMap";
import { RouteStopsList } from "./RouteStopsList";
import { RouteFormHeader } from "./RouteFormHeader";
import { RouteBasicFields } from "./RouteBasicFields";
import type { Database } from "@/integrations/supabase/types";
import type { Service } from "@/types/routes";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];
type LocationType = RouteInsert["start_location_type"];

interface RouteFormProps {
  onSave: (routeData: RouteInsert, selectedStops: Service[], routeId?: string) => Promise<void>;
  isLoading: boolean;
}

export const RouteForm = ({ onSave, isLoading }: RouteFormProps) => {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("id");
  const mode = searchParams.get("mode");
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

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("user_type", "agent");

      if (error) throw error;
      return data as Agent[];
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
      return data as SystemSettings;
    },
  });

  useEffect(() => {
    if (routeId) {
      const fetchRoute = async () => {
        const { data, error } = await supabase
          .from("routes")
          .select("*")
          .eq("id", routeId)
          .single();

        if (error) {
          console.error("Error fetching route:", error);
          return;
        }

        if (data) {
          setRouteName(data.name);
          setSelectedAgent(data.agent_id);
          setDate(new Date(data.start_time));
          setStartLocationType(data.start_location_type);
          setEndLocationType(data.end_location_type);
          setSelectedStartService(data.start_location_reference);
          setSelectedEndService(data.end_location_reference);
          
          // Fetch route stops
          const { data: stopsData } = await supabase
            .from("route_stops")
            .select("*, service:services(*)")
            .eq("route_id", routeId)
            .order("sequence_number");

          if (stopsData) {
            setSelectedStops(stopsData.map((stop: any) => stop.service));
          }
        }
      };

      fetchRoute();
    }
  }, [routeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedAgent || !routeName || selectedStops.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const routeData: RouteInsert = {
      name: routeName,
      agent_id: selectedAgent,
      start_time: date.toISOString(),
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

    await onSave(routeData, selectedStops, routeId || undefined);
  };

  const handleRouteStats = (distance: number, duration: number) => {
    setRouteStats({ distance, duration });
  };

  const isViewMode = mode === "view";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
      <div className="space-y-8">
        <RouteFormHeader
          onSave={handleSubmit}
          isLoading={isLoading}
          routeId={routeId}
          isViewMode={isViewMode}
        />
        
        <RouteBasicFields
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
          agents={agents}
          services={services}
          disabled={isViewMode}
        />

        <RouteStopsList 
          services={services || []}
          selectedStops={selectedStops}
          onStopsChange={setSelectedStops}
          disabled={isViewMode}
        />
      </div>

      <div className="h-[calc(100vh-6rem)] sticky top-24">
        <RouteMap 
          settings={settings}
          selectedStops={selectedStops}
          startLocationType={startLocationType}
          endLocationType={endLocationType}
          selectedStartService={services?.find(s => s.id === selectedStartService)}
          selectedEndService={services?.find(s => s.id === selectedEndService)}
          onRouteStats={handleRouteStats}
        />
      </div>
    </form>
  );
};
