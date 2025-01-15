import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
            <AddressSearch
              value=""
              onChange={(value) => {}}
              onLocationSelect={(location) => {
                updateSettings({
                  id: "1", // You should get this from your settings query
                  base_address: value,
                  base_latitude: location.lat,
                  base_longitude: location.lng,
                });
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};