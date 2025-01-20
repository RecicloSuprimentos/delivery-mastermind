import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RouteMap } from "./RouteMap";
import { RouteStopsList } from "./RouteStopsList";
import { RouteNameField } from "./RouteNameField";
import { AgentSelect } from "./AgentSelect";
import { DateTimePicker } from "./DateTimePicker";
import { LocationFields } from "./LocationFields";
import type { Database } from "@/integrations/supabase/types";

type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];
type LocationType = RouteInsert["start_location_type"];

interface Agent {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  time_window?: string;
}

interface SystemSettings {
  id: string;
  operational_base_address: string;
  operational_base_latitude: number;
  operational_base_longitude: number;
  service_default_duration: number;
}

interface Route {
  id: string;
  name: string;
  agent_id: string;
  start_time: string;
  start_location_type: LocationType;
  start_location_reference: string;
  end_location_type: LocationType;
  end_location_reference: string;
  total_distance?: number;
  total_duration?: number;
}

export const RouteForm = () => {
  const navigate = useNavigate();
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

  const handleSave = async () => {
    if (!date || !selectedAgent || !routeName || selectedStops.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
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

      let route;
      if (routeId) {
        const { data: updatedRoute, error: routeError } = await supabase
          .from("routes")
          .update(routeData)
          .eq("id", routeId)
          .select()
          .single();

        if (routeError) throw routeError;
        route = updatedRoute;

        // Delete existing stops
        await supabase
          .from("route_stops")
          .delete()
          .eq("route_id", routeId);
      } else {
        const { data: newRoute, error: routeError } = await supabase
          .from("routes")
          .insert(routeData)
          .select()
          .single();

        if (routeError) throw routeError;
        route = newRoute;
      }

      const stops = selectedStops.map((service, index) => ({
        route_id: route.id,
        service_id: service.id,
        sequence_number: index + 1,
      }));

      const { error: stopsError } = await supabase
        .from("route_stops")
        .insert(stops);

      if (stopsError) throw stopsError;

      // Update services status to "assigned"
      const { error: updateError } = await supabase
        .from("services")
        .update({ status: "assigned" })
        .in("id", selectedStops.map(s => s.id));

      if (updateError) throw updateError;

      toast({
        title: routeId ? "Rota atualizada com sucesso!" : "Rota criada com sucesso!",
        description: "A rota foi salva e está pronta para ser utilizada.",
      });
      navigate("/routes");
    } catch (error) {
      console.error("Erro ao salvar rota:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a rota.",
        variant: "destructive",
      });
    }
  };

  const handleRouteStats = (distance: number, duration: number) => {
    setRouteStats({ distance, duration });
  };

  const isViewMode = mode === "view";

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">
            {routeId ? (isViewMode ? "Visualizar Rota" : "Editar Rota") : "Criar Rota"}
          </h1>
          
          <div className="space-y-4">
            <RouteNameField 
              value={routeName} 
              onChange={setRouteName}
              disabled={isViewMode}
            />
            <AgentSelect 
              agents={agents} 
              value={selectedAgent} 
              onChange={setSelectedAgent}
              disabled={isViewMode}
            />
            <DateTimePicker 
              date={date} 
              onDateChange={setDate}
              disabled={isViewMode}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <LocationFields
                label="Local de Início"
                locationType={startLocationType}
                onLocationTypeChange={setStartLocationType}
                selectedService={selectedStartService}
                onServiceChange={setSelectedStartService}
                services={services}
                disabled={isViewMode}
              />
              <LocationFields
                label="Local de Término"
                locationType={endLocationType}
                onLocationTypeChange={setEndLocationType}
                selectedService={selectedEndService}
                onServiceChange={setSelectedEndService}
                services={services}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        <RouteStopsList 
          services={services || []}
          selectedStops={selectedStops}
          onStopsChange={setSelectedStops}
          disabled={isViewMode}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate("/routes")}>
            {isViewMode ? "Fechar" : "Cancelar"}
          </Button>
          {!isViewMode && <Button onClick={handleSave}>Salvar</Button>}
        </div>
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
    </div>
  );
};