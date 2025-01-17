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
import { CalendarIcon, MapPin } from "lucide-react";
import { RouteMap } from "./RouteMap";
import { RouteStopsList } from "./RouteStopsList";

interface Agent {
  id: string;
  name: string;
  email: string;
}

export const RouteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [startLocationType, setStartLocationType] = useState("operational_base");
  const [endLocationType, setEndLocationType] = useState("operational_base");

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

  const handleSave = async () => {
    // Implementar lógica de salvamento
    toast({
      title: "Rota criada com sucesso!",
      description: "A rota foi salva e está pronta para ser utilizada.",
    });
    navigate("/routes");
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">Criar Rota</h1>
          
          <div className="space-y-4">
            <div>
              <Label>Nome da Rota</Label>
              <Input placeholder="Digite o nome da rota" />
            </div>

            <div>
              <Label>Agente Responsável</Label>
              <Select>
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
                    {date ? format(date, "PPP HH:mm") : "Selecione uma data"}
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
            </div>
          </div>
        </div>

        <RouteStopsList />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate("/routes")}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>

      <div className="h-[calc(100vh-6rem)] sticky top-24">
        <RouteMap />
      </div>
    </div>
  );
};