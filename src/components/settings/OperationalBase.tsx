import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Save, Building2, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
      companyName,
      companyPhone,
    }: {
      id: string;
      address: string;
      location: Location;
      companyName: string;
      companyPhone: string;
    }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({
          operational_base_address: address,
          operational_base_latitude: location.lat,
          operational_base_longitude: location.lng,
          company_name: companyName,
          company_phone: companyPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({
        title: "Base operacional atualizada!",
        description: "As configurações foram salvas com sucesso.",
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
            {settings.company_name && (
              <div>
                <strong>Empresa:</strong> {settings.company_name}
              </div>
            )}
            {settings.company_phone && (
              <div>
                <strong>Telefone:</strong> {settings.company_phone}
              </div>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export const OperationalBase = () => {
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
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
      setCompanyName(settings.company_name || "");
      setCompanyPhone(settings.company_phone || "");
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
      companyName,
      companyPhone,
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
            {/* Endereço */}
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
              </div>
            </div>

            {/* Dados do Remetente para Lalamove */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#f27421]" />
                Dados do Remetente (exibidos ao motorista Lalamove)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    placeholder="Ex: Reciclo Cartuchos"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company-phone">
                    Telefone <span className="text-gray-400 font-normal">(formato: +5531999999999)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="company-phone"
                      className="pl-9"
                      placeholder="+5531999999999"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {settings && <CurrentBaseInfo settings={settings} />}
    </div>
  );
};