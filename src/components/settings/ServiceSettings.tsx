import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type SystemSettings = Database["public"]["Tables"]["system_settings"]["Row"];

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
        .maybeSingle();
      if (error) throw error;
      return data as SystemSettings;
    },
  });

  useEffect(() => {
    if (settings?.service_default_duration) {
      setDuration(settings.service_default_duration);
    }
  }, [settings]);

  const { mutate: updateSettings } = useMutation({
    mutationFn: async (newDuration: number) => {
      if (!settings?.id) throw new Error("Configurações não encontradas");
      
      const { error } = await supabase
        .from("system_settings")
        .update({
          service_default_duration: newDuration,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({
        title: "Duração atualizada!",
        description: "A duração média dos serviços foi atualizada com sucesso.",
      });
    },
  });

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
              <Button onClick={() => updateSettings(duration)} className="gap-2">
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