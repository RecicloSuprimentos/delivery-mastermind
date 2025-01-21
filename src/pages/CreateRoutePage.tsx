import { useRouteForm } from "@/hooks/useRouteForm";
import { RouteFormHeader } from "@/components/routes/RouteFormHeader";
import { RouteServicesSelection } from "@/components/routes/RouteServicesSelection";
import { useToast } from "@/hooks/use-toast";

const CreateRoutePage = () => {
  const { toast } = useToast();
  const {
    settings,
    services,
    selectedServices,
    toggleServiceSelection,
  } = useRouteForm();

  const handleSave = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um serviço para criar a rota",
        variant: "destructive",
      });
      return;
    }

    // Implementar lógica de salvamento
    toast({
      title: "Sucesso",
      description: "Rota criada com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <RouteFormHeader
        onSave={handleSave}
        isLoading={false}
      />
      <RouteServicesSelection
        services={services || []}
        selectedServices={selectedServices}
        onToggleService={toggleServiceSelection}
      />
    </div>
  );
};

export default CreateRoutePage;