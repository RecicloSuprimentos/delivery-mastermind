
import { RouteForm } from "@/components/routes/RouteForm";
import { useParams } from "react-router-dom";
import { useRouteQuery } from "@/hooks/routes/useRouteQuery";
import { useRouteMutations } from "@/hooks/routes/useRouteMutations";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const EditRoutePage = () => {
  const { id } = useParams();
  const { route } = useRouteQuery(id);
  const { saveRoute } = useRouteMutations(id);
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
        description: "Rota atualizada com sucesso",
      });

      navigate("/routes");
    } catch (error) {
      console.error("Erro ao atualizar rota:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar a rota. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-8">
      <RouteForm 
        onSave={handleSave} 
        isLoading={saveRoute.isPending}
        routeId={id}
        initialData={route}
      />
    </div>
  );
};

export default EditRoutePage;
