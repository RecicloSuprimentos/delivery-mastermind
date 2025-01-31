import { RouteMap } from "./RouteMap";
import { RouteStopsList } from "./RouteStopsList";
import { RouteBasicFields } from "./RouteBasicFields";
import { useRouteFormState } from "./form/useRouteFormState";
import { useToast } from "@/components/ui/use-toast";
import type { Service, SystemSettings } from "@/types/routes";

interface RouteFormContentProps {
  routeName: string;
  setRouteName: (value: string) => void;
  selectedAgent?: string;
  setSelectedAgent: (value: string) => void;
  date?: Date;
  setDate: (value: Date) => void;
  startLocationType: "operational_base" | "service";
  setStartLocationType: (value: "operational_base" | "service") => void;
  endLocationType: "operational_base" | "service";
  setEndLocationType: (value: "operational_base" | "service") => void;
  selectedStartService?: string;
  setSelectedStartService: (value: string) => void;
  selectedEndService?: string;
  setSelectedEndService: (value: string) => void;
  selectedStops: Service[];
  setSelectedStops: (stops: Service[]) => void;
  onOptimize: () => void;
  onRouteStats: (distance: number, duration: number) => void;
  onOptimizedStops: (stops: Service[]) => void;
  agents?: { id: string; name: string; email: string }[];
  services?: Service[];
  settings?: SystemSettings;
  isViewMode?: boolean;
  routeStatus?: string;
  originalStops?: Service[];
}

export const RouteFormContent = ({
  routeName,
  setRouteName,
  selectedAgent,
  setSelectedAgent,
  date,
  setDate,
  startLocationType,
  setStartLocationType,
  endLocationType,
  setEndLocationType,
  selectedStartService,
  setSelectedStartService,
  selectedEndService,
  setSelectedEndService,
  selectedStops,
  setSelectedStops,
  onOptimize,
  onRouteStats,
  onOptimizedStops,
  agents,
  services,
  settings,
  isViewMode,
  routeStatus,
  originalStops = [],
}: RouteFormContentProps) => {
  const { toast } = useToast();
  const { shouldOptimize, handleOptimize, resetOptimization } = useRouteFormState();

  // Verifica se a rota está finalizada
  const isCompleted = routeStatus === "completed";
  
  // Verifica se a rota está em andamento (atribuída ou aceita)
  const isInProgress = routeStatus === "assigned" || routeStatus === "accepted";

  // Função para validar alterações nos serviços
  const handleStopsChange = (newStops: Service[]) => {
    if (isCompleted) {
      toast({
        title: "Operação não permitida",
        description: "Não é possível editar uma rota finalizada.",
        variant: "destructive",
      });
      return;
    }

    if (isInProgress) {
      // Verifica se algum serviço existente foi alterado (exceto remoção)
      const hasInvalidChanges = originalStops.some(originalStop => {
        const stillExists = newStops.find(s => s.id === originalStop.id);
        // Se o serviço ainda existe na rota, não permitimos alteração
        if (stillExists && originalStop.status !== stillExists.status) {
          return true;
        }
        return false;
      });

      if (hasInvalidChanges) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível alterar o status de serviços em uma rota em andamento.",
          variant: "destructive",
        });
        return;
      }
    }

    setSelectedStops(newStops);
    resetOptimization();
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-8">
        <RouteBasicFields
          routeName={routeName}
          setRouteName={setRouteName}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          date={date}
          setDate={setDate}
          startLocationType={startLocationType}
          setStartLocationType={setStartLocationType}
          endLocationType={endLocationType}
          setEndLocationType={setEndLocationType}
          selectedStartService={selectedStartService}
          setSelectedStartService={setSelectedStartService}
          selectedEndService={selectedEndService}
          setSelectedEndService={setSelectedEndService}
          agents={agents}
          services={services}
          disabled={isViewMode || isCompleted}
        />

        <RouteStopsList 
          services={services || []}
          selectedStops={selectedStops}
          onStopsChange={handleStopsChange}
          onOptimize={() => handleOptimize(onOptimize)}
          disabled={isViewMode || isCompleted}
        />
      </div>

      <div className="h-[calc(100vh-6rem)] sticky top-24">
        <RouteMap 
          settings={settings}
          selectedStops={selectedStops}
          startLocationType={startLocationType}
          endLocationType={endLocationType}
          selectedStartService={services?.find(s => s.id === selectedStartService)}
          selectedEndService={services?.find(s => s.id === selectedEndService)}
          onRouteStats={onRouteStats}
          onOptimizedStops={onOptimizedStops}
          shouldOptimize={shouldOptimize}
        />
      </div>
    </div>
  );
};