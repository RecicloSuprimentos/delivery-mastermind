import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings,
  UserPlus,
  MapPin,
  Key,
  Clock,
  Link,
  Search,
  Save,
  Edit,
  Trash,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import AddressSearch from "@/components/AddressSearch";

type UserType = "admin" | "user" | "agent";

const SettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [baseAddress, setBaseAddress] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    user_type: "user" as UserType,
    is_active: true,
  });

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ["systemUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch system settings
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

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const { error } = await supabase.from("system_users").insert([userData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
      toast({
        title: "Usuário criado com sucesso!",
        description: "O novo usuário foi adicionado ao sistema.",
      });
    },
  });

  // Update system settings mutation
  const updateSettings = useMutation({
    mutationFn: async (settings: Partial<typeof systemSettings>) => {
      const { error } = await supabase
        .from("system_settings")
        .update(settings)
        .eq("id", systemSettings?.id);
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

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("system_users")
        .delete()
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    },
  });

  const handleCreateUser = async () => {
    await createUser.mutateAsync(newUser);
    setNewUser({
      name: "",
      email: "",
      user_type: "user",
      is_active: true,
    });
  };

  const handleUpdateSettings = async (settings: Partial<typeof systemSettings>) => {
    await updateSettings.mutateAsync(settings);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await deleteUser.mutateAsync(userId);
    }
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Usuários do Sistema</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do novo usuário do sistema.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Tipo de Usuário</Label>
                        <Select
                          value={newUser.user_type}
                          onValueChange={(value) =>
                            setNewUser({ ...newUser, user_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="agent">Agente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Switch
                          id="status"
                          checked={newUser.is_active}
                          onCheckedChange={(checked) =>
                            setNewUser({ ...newUser, is_active: checked })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleCreateUser}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Salvar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.user_type === "admin"
                              ? "Administrador"
                              : user.user_type === "agent"
                              ? "Agente"
                              : "Usuário"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.is_active ? "default" : "destructive"}
                          >
                            {user.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              // TODO: Implement edit
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operational">
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
                      value={baseAddress}
                      onChange={setBaseAddress}
                      onLocationSelect={(location) => {
                        handleUpdateSettings({
                          base_address: baseAddress,
                          base_latitude: location.lat,
                          base_longitude: location.lng,
                        });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                            handleUpdateSettings({
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

          <TabsContent value="services">
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
                        value={systemSettings?.average_service_duration || 60}
                        onChange={(e) =>
                          handleUpdateSettings({
                            average_service_duration: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        className="w-32"
                      />
                      <Button
                        onClick={() =>
                          handleUpdateSettings({
                            average_service_duration:
                              systemSettings?.average_service_duration || 60,
                          })
                        }
                        className="gap-2"
                      >
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
                          handleUpdateSettings({
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
                    <Switch
                      id="api-status"
                      // TODO: Implement API status toggle
                    />
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
