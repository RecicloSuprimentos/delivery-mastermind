import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Key, Eye, EyeOff, Copy, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const ApiKeys = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { mutate: updateSettings } = useMutation({
    mutationFn: async (key: string) => {
      if (!settings?.id) throw new Error("Configurações não encontradas");
      
      const { error } = await supabase
        .from("system_settings")
        .update({ google_maps_key: key })
        .eq("id", settings.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({
        title: "Chave API atualizada!",
        description: "A chave do Google Maps foi salva com sucesso.",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Chaves de API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Chave API do Google Maps</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={googleMapsKey || settings?.google_maps_key || ""}
                  onChange={(e) => setGoogleMapsKey(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (settings?.google_maps_key) {
                    navigator.clipboard.writeText(settings.google_maps_key);
                    toast({
                      title: "Chave copiada!",
                      description: "A chave API foi copiada para a área de transferência.",
                    });
                  }
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => updateSettings(googleMapsKey)}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta chave é utilizada para os serviços de geolocalização e
              autocompletar endereços no sistema.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};