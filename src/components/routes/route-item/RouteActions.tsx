
import { Button } from "@/components/ui/button";
import { Printer, Eye, Edit, Check, X, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { useRoutes } from "@/hooks/useRoutes";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const handleCancelRouteKeepServices = async () => {
    try {
      // 1. Buscar todos os serviços da rota
      const { data: routeStops, error: stopsError } = await supabase
        .from('route_stops')
        .select('service_id')
        .eq('route_id', route.id);
        
      if (stopsError) throw stopsError;

      const serviceIds = routeStops.map(stop => stop.service_id);

      if (serviceIds.length > 0) {
        // 2. Atualizar serviços para 'not-assigned'
        const { error: updateError } = await supabase
          .from('services')
          .update({ status: 'not-assigned' })
          .in('id', serviceIds);
          
        if (updateError) throw updateError;
        
        // 3. Deletar as paradas da rota
        const { error: deleteError } = await supabase
          .from('route_stops')
          .delete()
          .eq('route_id', route.id);
          
        if (deleteError) throw deleteError;
      }
      
      // 4. Atualizar a rota para cancelada
      const { error: routeError } = await supabase
        .from('routes')
        .update({ status: 'cancelled' })
        .eq('id', route.id);

      if (routeError) throw routeError;

      toast({
        title: "Sucesso",
        description: "Rota cancelada e serviços liberados com sucesso",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error cancelling route and keeping services:", error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar a rota e liberar serviços",
        variant: "destructive",
      });
    }
  };

  const handleCancelRoute = async () => {
    try {
      const { error } = await supabase.rpc('cancel_route', {
        route_id_param: route.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Rota e serviços cancelados com sucesso",
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Rota?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 mt-2 space-y-3">
                <p>Você tem duas opções ao cancelar esta rota:</p>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                  <strong className="text-amber-800">1. Cancelar rota e liberar serviços</strong>
                  <p className="text-sm mt-1">A rota será cancelada, mas os serviços associados voltarão para o status "Não Atribuído" no quadro Kanban para serem despachados novamente.</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <strong className="text-red-800">2. Cancelar Tudo</strong>
                  <p className="text-sm mt-1">A rota e TODOS os serviços associados serão cancelados permanentemente. Esta ação não pode ser desfeita.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <AlertDialogCancel className="mt-0">Voltar</AlertDialogCancel>
              
              <AlertDialogAction 
                onClick={handleCancelRouteKeepServices}
                className="bg-amber-600 hover:bg-amber-700 text-white border-0"
              >
                Liberar serviços
              </AlertDialogAction>
              
              <AlertDialogAction 
                onClick={handleCancelRoute}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Cancelar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={async () => {
          try {
            toast({
              title: "Gerando documento...",
              description: "Buscando os endereços da rota no servidor.",
            });
            await onPrint(route);
          } catch (error) {
            toast({
              title: "Erro",
              description: "Não foi possível gerar a impressão.",
              variant: "destructive",
            });
          }
        }}
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
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(`/routes/lalamove/${route.id}`)}
        className="h-6 w-6 p-0 text-[#f27421] hover:text-[#d1611a] hover:bg-[#f27421]/10"
        title="Enviar para Lalamove"
      >
        <Truck className="h-4 w-4" />
      </Button>
    </div>
  );
};
