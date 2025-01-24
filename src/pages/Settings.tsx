import { Link, UserPlus, MapPin, Key, Clock, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAuthManagement } from "@/components/settings/UserAuthManagement";
import { OperationalBase } from "@/components/settings/OperationalBase";
import { ServiceSettings } from "@/components/settings/ServiceSettings";
import { ApiKeys } from "@/components/settings/ApiKeys";
import { SettingsHeader } from "@/components/settings/SettingsHeader";

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6 pt-20">
      <SettingsHeader />

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
            <UserAuthManagement />
          </TabsContent>

          <TabsContent value="operational">
            <OperationalBase />
          </TabsContent>

          <TabsContent value="services">
            <ServiceSettings />
          </TabsContent>

          <TabsContent value="api">
            <ApiKeys />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;