import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AddressSearch from "@/components/AddressSearch";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null);
  
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
    if (settings?.base_address) {
      setAddress(settings.base_address);
      if (settings.base_latitude && settings.base_longitude) {
        setSelectedLocation({
          lat: settings.base_latitude,
          lng: settings.base_longitude
        });
      }
    }
  }, [settings]);
  
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
        title: "Base operacional atualizada!",
        description: "O endereço da base foi salvo com sucesso.",
      });
    },
  });

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
  };

  const handleSave = () => {
    if (!selectedLocation || !address) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um endereço válido.",
        variant: "destructive",
      });
      return;
    }

    if (settings) {
      updateSettings({
        id: settings.id,
        base_address: address,
        base_latitude: selectedLocation.lat,
        base_longitude: selectedLocation.lng,
      });
    }
  };

  return (
    <div className="space-y-4">
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
                <div className="flex-1">
                  <AddressSearch
                    value={address}
                    onChange={setAddress}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
                <Button onClick={handleSave} className="whitespace-nowrap gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {settings?.base_address && (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription className="flex flex-col gap-2">
                <div>
                  <strong>Endereço atual:</strong> {settings.base_address}
                </div>
                <div>
                  <strong>Coordenadas:</strong> {settings.base_latitude}, {settings.base_longitude}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};