
import { useSearchParams } from "react-router-dom";
import { RouteForm } from "@/components/routes/RouteForm";
import { useRouteQuery } from "@/hooks/routes/useRouteQuery";
import { useRouteMutations } from "@/hooks/routes/useRouteMutations";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const CreateRoutePage = () => {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const { route } = useRouteQuery(routeId);
  const { saveRoute } = useRouteMutations(routeId);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = async (routeData: any, stops: any[]) => {
    try {
      await saveRoute.mutateAsync({
        routeData,
        stops: stops.map(stop => ({ service_id: stop.id }))
      });

      toast({
        title: "Sucesso",
        description: "Rota salva com sucesso",
      });

      navigate("/routes");
    } catch (error) {
      console.error("Erro ao salvar rota:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a rota. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isViewMode = mode === "view";

  return (
    <div className="min-h-screen bg-background px-8">
      <RouteForm 
        onSave={handleSave} 
        isLoading={saveRoute.isPending}
        routeId={routeId}
        initialData={route}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default CreateRoutePage;
