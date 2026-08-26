
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
  
  // Verifica se há algum serviço concluído ou em trânsito
  const hasStartedServices = selectedStops.some(stop => 
    stop.status === "completed" || stop.status === "in-transit"
  );

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

    // Atualiza os serviços selecionados
    setSelectedStops(newStops);
    // Reseta o estado de otimização quando a lista de serviços muda
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
          selectedStops={selectedStops}
          disabled={isViewMode || isCompleted || hasStartedServices}
          disableOnlyStart={hasStartedServices}
        />

        <RouteStopsList 
          services={services || []}
          selectedStops={selectedStops}
          onStopsChange={handleStopsChange}
          onOptimize={() => handleOptimize(onOptimize)}
          disabled={isViewMode || isCompleted}
          selectedStartService={selectedStartService}
          selectedEndService={selectedEndService}
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
