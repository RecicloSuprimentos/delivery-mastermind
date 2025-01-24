import { RotateCw, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteStopsHeaderProps {
  onOptimize: () => void;
  onInvert: () => void;
  onAddAll: () => void;
  disabled?: boolean;
  hasAvailableServices: boolean;
}

export const RouteStopsHeader = ({
  onOptimize,
  onInvert,
  onAddAll,
  disabled,
  hasAvailableServices,
}: RouteStopsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">Paradas da Rota</h2>
      <div className="space-x-2">
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={onOptimize}
          disabled={disabled}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Otimizar
        </Button>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={onInvert}
          disabled={disabled}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Inverter
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddAll}
          disabled={disabled || !hasAvailableServices}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Todos
        </Button>
      </div>
    </div>
  );
};