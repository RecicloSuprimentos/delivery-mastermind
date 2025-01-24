import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceSelector } from "@/components/services/ServiceSelector";
import { MapComponent } from "@/components/map/MapComponent";
import { calculateRoute } from "@/utils/routeOptimization";
import type { Service } from "@/types/routes";

export const RouteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [startLocation, setStartLocation] = useState<string>("operational_base");
  const [endLocation, setEndLocation] = useState<string>("operational_base");
  const [isLoading, setIsLoading] = useState(false);

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      // Filtrar apenas usuários do tipo agent
      return users
        .filter(user => user.user_metadata?.user_type === "agent")
        .map(user => ({
          id: user.id,
          name: user.user_metadata?.name || "Sem nome",
          email: user.email || ""
        }));
    },
  });

  const { data: route } = useQuery({
    queryKey: ["route", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("routes")
        .select(`
          *,
          route_stops (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (route) {
      setName(route.name);
      setAgentId(route.agent_id || "");
      setStartLocation(route.start_location_type);
      setEndLocation(route.end_location_type);
      
      // Carregar serviços da rota
      if (route.route_stops) {
        const services = route.route_stops
          .sort((a, b) => a.sequence_number - b.sequence_number)
          .map(stop => ({
            id: stop.service_id,
            sequence: stop.sequence_number,
          }));
        setSelectedServices(services);
      }
    }
  }, [route]);

  const createRoute = useMutation({
    mutationFn: async (routeData: any) => {
      const { data, error } = await supabase
        .from("routes")
        .insert([routeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast({
        title: "Rota criada com sucesso!",
        description: "A nova rota foi adicionada ao sistema.",
      });
      navigate("/routes");
    },
  });

  const updateRoute = useMutation({
    mutationFn: async ({ routeId, routeData }: { routeId: string; routeData: any }) => {
      const { data, error } = await supabase
        .from("routes")
        .update(routeData)
        .eq("id", routeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast({
        title: "Rota atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      navigate("/routes");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const routeData = {
        name,
        agent_id: agentId || null,
        start_location_type: startLocation,
        end_location_type: endLocation,
        status: "pending",
      };

      if (id) {
        await updateRoute.mutateAsync({ routeId: id, routeData });
      } else {
        await createRoute.mutateAsync(routeData);
      }
    } catch (error) {
      console.error("Erro ao salvar rota:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar rota",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar salvar a rota",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Rota</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agent">Agente</Label>
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem agente</SelectItem>
              {agents?.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ponto de Partida</Label>
          <Select value={startLocation} onValueChange={setStartLocation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational_base">Base Operacional</SelectItem>
              <SelectItem value="service">Primeiro Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ponto de Chegada</Label>
          <Select value={endLocation} onValueChange={setEndLocation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational_base">Base Operacional</SelectItem>
              <SelectItem value="service">Último Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Serviços</Label>
          <ServiceSelector
            selectedServices={selectedServices}
            onChange={setSelectedServices}
          />
        </div>

        {selectedServices.length > 0 && (
          <div className="h-96">
            <MapComponent services={selectedServices} />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/routes")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};