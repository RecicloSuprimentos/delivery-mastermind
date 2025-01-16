import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ServiceSettings {
  id: string;
  average_service_duration: number;
}

export const ServiceSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState<number>(10);

  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings?.average_service_duration) {
      setDuration(settings.average_service_duration);
    }
  }, [settings]);

  const { mutate: updateSettings } = useMutation({
    mutationFn: async (settings: ServiceSettings) => {
      const { error } = await supabase
        .from("system_settings")
        .update(settings)
        .eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({
        title: "Configurações atualizadas!",
        description: "A duração média dos serviços foi atualizada com sucesso.",
      });
    },
  });

  const handleSave = () => {
    if (settings) {
      updateSettings({
        id: settings.id,
        average_service_duration: duration,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Configurações de Serviços
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Duração Média dos Serviços (minutos)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                className="w-32"
              />
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Este tempo será utilizado como padrão no cálculo de rotas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};