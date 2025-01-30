import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AddressSearch } from "@/components/AddressSearch";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Database } from "@/integrations/supabase/types";

type SystemSettings = Database["public"]["Tables"]["system_settings"]["Row"];

interface Location {
  lat: number;
  lng: number;
}

const useSystemSettings = () => {
  return useQuery({
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
};

const useUpdateSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      address,
      location,
    }: {
      id: string;
      address: string;
      location: Location;
    }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({
          operational_base_address: address,
          operational_base_latitude: location.lat,
          operational_base_longitude: location.lng,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

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
};

const CurrentBaseInfo = ({ settings }: { settings: SystemSettings }) => {
  if (!settings?.operational_base_address) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <Alert>
          <AlertDescription className="flex flex-col gap-2">
            <div>
              <strong>Endereço atual:</strong> {settings.operational_base_address}
            </div>
            <div>
              <strong>Coordenadas:</strong> {settings.operational_base_latitude},{" "}
              {settings.operational_base_longitude}
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export const OperationalBase = () => {
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { data: settings } = useSystemSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      if (settings.operational_base_latitude && settings.operational_base_longitude) {
        setSelectedLocation({
          lat: settings.operational_base_latitude,
          lng: settings.operational_base_longitude,
        });
      }
    }
  }, [settings]);

  const handleSave = () => {
    if (!selectedLocation || !address || !settings?.id) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um endereço válido.",
        variant: "destructive",
      });
      return;
    }

    updateSettings.mutate({
      id: settings.id,
      address,
      location: selectedLocation,
    });
    setAddress("");
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
                    onLocationSelect={setSelectedLocation}
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

      {settings && <CurrentBaseInfo settings={settings} />}
    </div>
  );
};