
import { Button } from "@/components/ui/button";
import { Printer, Eye, Edit, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { useRoutes } from "@/hooks/useRoutes";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RouteActionsProps {
  route: Route;
  onPrint: (route: Route) => void;
}

export const RouteActions = ({ route, onPrint }: RouteActionsProps) => {
  const navigate = useNavigate();
  const { updateRouteStatus } = useRoutes();
  const { toast } = useToast();

  const handleAcceptRoute = async () => {
    try {
      await updateRouteStatus.mutateAsync({
        routeId: route.id,
        status: 'accepted'
      });
    } catch (error) {
      console.error("Error accepting route:", error);
    }
  };

  const handleCancelRoute = async () => {
    if (!window.confirm("Tem certeza que deseja cancelar esta rota? Todos os serviços associados também serão cancelados.")) {
      return;
    }

    try {
      const { error } = await supabase.rpc('cancel_route', {
        route_id_param: route.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Rota cancelada com sucesso",
      });

      // Atualizar a lista de rotas
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling route:", error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar a rota",
        variant: "destructive",
      });
    }
  };

  const canBeCancelled = route.status !== 'completed' && route.status !== 'cancelled';

  return (
    <div className="flex space-x-1">
      {route.status === 'draft' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAcceptRoute}
          className="h-6 w-6 p-0"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      )}
      {canBeCancelled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancelRoute}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onPrint(route)}
        className="h-6 w-6 p-0"
      >
        <Printer className="h-3.5 w-3.5" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(`/routes/new?id=${route.id}&mode=view`)}
        className="h-6 w-6 p-0"
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(`/routes/edit/${route.id}`)}
        className="h-6 w-6 p-0"
      >
        <Edit className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
