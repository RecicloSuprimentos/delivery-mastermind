import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
}

export const RouteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [startLocationType, setStartLocationType] = useState<LocationType>("operational_base");
  const [endLocationType, setEndLocationType] = useState<LocationType>("operational_base");
  const [selectedStartService, setSelectedStartService] = useState<string>();
  const [selectedEndService, setSelectedEndService] = useState<string>();
  const [routeName, setRouteName] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>();
  const [selectedStops, setSelectedStops] = useState<Service[]>([]);

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
      };

      const { data: route, error: routeError } = await supabase
        .from("routes")
        .insert(routeData)
        .select()
        .single();

      if (routeError) throw routeError;

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
        title: "Rota criada com sucesso!",
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

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">Criar Rota</h1>
          
          <div className="space-y-4">
            <RouteNameField value={routeName} onChange={setRouteName} />
            <AgentSelect agents={agents} value={selectedAgent} onChange={setSelectedAgent} />
            <DateTimePicker date={date} onDateChange={setDate} />
            
            <div className="grid grid-cols-2 gap-4">
              <LocationFields
                label="Local de Início"
                locationType={startLocationType}
                onLocationTypeChange={setStartLocationType}
                selectedService={selectedStartService}
                onServiceChange={setSelectedStartService}
                services={services}
              />
              <LocationFields
                label="Local de Término"
                locationType={endLocationType}
                onLocationTypeChange={setEndLocationType}
                selectedService={selectedEndService}
                onServiceChange={setSelectedEndService}
                services={services}
              />
            </div>
          </div>
        </div>

        <RouteStopsList 
          services={services || []}
          selectedStops={selectedStops}
          onStopsChange={setSelectedStops}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate("/routes")}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
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
        />
      </div>
    </div>
  );
};