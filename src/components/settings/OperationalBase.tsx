import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AddressSearch from "@/components/AddressSearch";
import { useToast } from "@/components/ui/use-toast";

interface SystemSettings {
  id: string;
  base_address?: string | null;
  base_latitude?: number | null;
  base_longitude?: number | null;
}

export const OperationalBase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  
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
  
  const { mutate: updateSettings } = useMutation({
    mutationFn: async (settings: SystemSettings) => {
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
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    },
  });

  const handleSave = (location: { lat: number; lng: number }, address: string) => {
    if (settings) {
      updateSettings({
        id: settings.id,
        base_address: address,
        base_latitude: location.lat,
        base_longitude: location.lng,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Base Operacional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Endereço da Base</Label>
            <div className="flex gap-2">
              <AddressSearch
                value={address}
                onChange={setAddress}
                onLocationSelect={handleSave}
              />
              <Button 
                onClick={() => {
                  if (!address) {
                    toast({
                      title: "Atenção",
                      description: "Por favor, selecione um endereço válido.",
                      variant: "destructive",
                    });
                    return;
                  }
                }}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};