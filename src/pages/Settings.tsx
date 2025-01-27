import { MapPin, Key, Clock, Users, Link, AlertTriangle, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAssignments } from "@/components/settings/UserAssignments";
import { OperationalBase } from "@/components/settings/OperationalBase";
import { ServiceSettings } from "@/components/settings/ServiceSettings";
import { ApiKeys } from "@/components/settings/ApiKeys";
import { ApiIntegration } from "@/components/settings/ApiIntegration";
import { ServiceFailureReasons } from "@/components/settings/ServiceFailureReasons";
import { PaymentMethods } from "@/components/settings/PaymentMethods";
import { SettingsHeader } from "@/components/settings/SettingsHeader";

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6 pt-20">
      <SettingsHeader />

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="assignments" className="gap-2">
            <Users className="h-4 w-4" />
            Atribuições
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
          <TabsTrigger value="failure-reasons" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Motivos de Insucesso
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="gap-2">
            <Wallet className="h-4 w-4" />
            Formas de Pagamento
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6">
          <TabsContent value="assignments">
            <UserAssignments />
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

          <TabsContent value="failure-reasons">
            <ServiceFailureReasons />
          </TabsContent>

          <TabsContent value="payment-methods">
            <PaymentMethods />
          </TabsContent>

          <TabsContent value="integrations">
            <ApiIntegration />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;