import { useState } from "react";
import {
  Settings,
  UserPlus,
  MapPin,
  Key,
  Clock,
  Link,
  Search,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserManagement } from "@/components/settings/UserManagement";
import { OperationalBase } from "@/components/settings/OperationalBase";
import { ServiceSettings } from "@/components/settings/ServiceSettings";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SystemSettings {
  id: string;
  google_maps_key?: string | null;
  api_key?: string | null;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const queryClient = useQueryClient();

  const { data: systemSettings } = useQuery({
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

  const handleUpdateSettings = useMutation({
    mutationFn: async (settings: Partial<SystemSettings> & { id: string }) => {
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
    <div className="container mx-auto p-6 space-y-6 pt-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar configurações..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="users" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="operational" className="gap-2">
            <MapPin className="h-4 w-4" />
            Base Operacional
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            APIs
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Clock className="h-4 w-4" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6">
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="operational">
            <OperationalBase />
          </TabsContent>

          <TabsContent value="services">
            <ServiceSettings />
          </TabsContent>

          <TabsContent value="api">
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
                          value={systemSettings?.google_maps_key || ""}
                          onChange={(e) =>
                            handleUpdateSettings.mutate({
                              id: systemSettings?.id || "",
                              google_maps_key: e.target.value,
                            })
                          }
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
                          if (systemSettings?.google_maps_key) {
                            navigator.clipboard.writeText(
                              systemSettings.google_maps_key
                            );
                            toast({
                              title: "Chave copiada!",
                              description:
                                "A chave API foi copiada para a área de transferência.",
                            });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Integrações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Chave de API para Integrações</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={systemSettings?.api_key || ""}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (systemSettings?.api_key) {
                            navigator.clipboard.writeText(systemSettings.api_key);
                            toast({
                              title: "Chave copiada!",
                              description:
                                "A chave de integração foi copiada para a área de transferência.",
                            });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateSettings.mutate({
                            id: systemSettings?.id || "",
                            api_key: crypto.randomUUID(),
                          })
                        }
                        className="gap-2"
                      >
                        <Key className="h-4 w-4" />
                        Gerar Nova
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Utilize esta chave para autenticar requisições de sistemas
                      externos.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="api-status" />
                    <Label htmlFor="api-status">Ativar integrações</Label>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Documentação da API</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Endpoint para criar novos serviços:
                    </p>
                    <code className="bg-muted p-2 rounded-md block text-sm">
                      POST /api/services
                    </code>
                    <Button variant="link" className="mt-2 h-auto p-0">
                      Ver documentação completa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;