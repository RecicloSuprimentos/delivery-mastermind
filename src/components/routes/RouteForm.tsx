import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { RouteMap } from "./RouteMap";
import { RouteStopsList } from "./RouteStopsList";

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
  const [startLocationType, setStartLocationType] = useState("operational_base");
  const [endLocationType, setEndLocationType] = useState("operational_base");
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
      const { data: route, error: routeError } = await supabase
        .from("routes")
        .insert({
          name: routeName,
          agent_id: selectedAgent,
          start_time: date.toISOString(),
          start_location_type: startLocationType,
          start_location_reference: startLocationType === "operational_base" ? 
            settings?.id : selectedStartService,
          end_location_type: endLocationType,
          end_location_reference: endLocationType === "operational_base" ? 
            settings?.id : selectedEndService,
        })
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
            <div>
              <Label>Nome da Rota</Label>
              <Input 
                placeholder="Digite o nome da rota" 
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>

            <div>
              <Label>Agente Responsável</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data e Hora de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Local de Início</Label>
              <RadioGroup
                value={startLocationType}
                onValueChange={setStartLocationType}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="operational_base" id="start-base" />
                  <Label htmlFor="start-base">Base Operacional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="start-service" />
                  <Label htmlFor="start-service">Serviço</Label>
                </div>
              </RadioGroup>
              {startLocationType === "service" && (
                <Select 
                  value={selectedStartService} 
                  onValueChange={setSelectedStartService}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.type.toUpperCase()} {service.service_id} - {service.customer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>Local de Término</Label>
              <RadioGroup
                value={endLocationType}
                onValueChange={setEndLocationType}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="operational_base" id="end-base" />
                  <Label htmlFor="end-base">Base Operacional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="end-service" />
                  <Label htmlFor="end-service">Serviço</Label>
                </div>
              </RadioGroup>
              {endLocationType === "service" && (
                <Select 
                  value={selectedEndService} 
                  onValueChange={setSelectedEndService}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.type.toUpperCase()} {service.service_id} - {service.customer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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