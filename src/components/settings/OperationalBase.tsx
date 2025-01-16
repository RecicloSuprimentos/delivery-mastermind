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
import type { Database } from "@/integrations/supabase/types";

type SystemSettings = Database["public"]["Tables"]["system_settings"]["Row"];

interface Location {
  lat: number;
  lng: number;
}

export const OperationalBase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

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
    if (settings?.operational_base) {
      const base = settings.operational_base;
      setAddress(base.address || "");
      if (base.latitude && base.longitude) {
        setSelectedLocation({
          lat: base.latitude,
          lng: base.longitude,
        });
      }
    }
  }, [settings]);

  const { mutate: updateSettings } = useMutation({
    mutationFn: async () => {
      if (!settings?.id || !selectedLocation) throw new Error("Dados inválidos");
      
      const { error } = await supabase
        .from("system_settings")
        .update({
          operational_base: {
            address,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          },
          updated_at: new Date().toISOString(),
        })
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

  const handleLocationSelect = (location: Location) => {
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

    updateSettings();
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

      {settings?.operational_base?.address && (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription className="flex flex-col gap-2">
                <div>
                  <strong>Endereço atual:</strong> {settings.operational_base.address}
                </div>
                <div>
                  <strong>Coordenadas:</strong> {settings.operational_base.latitude}, {settings.operational_base.longitude}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};