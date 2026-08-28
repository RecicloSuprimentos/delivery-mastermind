import { Package, Flag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types/routes";
import { DraggableProvided } from "@hello-pangea/dnd";

interface RouteStopItemProps {
  stop: Service;
  index?: number;
  onRemove?: (id: string) => void;
  disabled?: boolean;
  provided?: DraggableProvided;
  isFixedStart?: boolean;
  isFixedEnd?: boolean;
}

export const RouteStopItem = ({ 
  stop, 
  index, 
  onRemove, 
  disabled,
  provided,
  isFixedStart,
  isFixedEnd
}: RouteStopItemProps) => {
  // Verifica se o serviço está em andamento ou concluído
  const isInProgressOrCompleted = stop.status === 'in-transit' || stop.status === 'completed';
  
  let Icon = Package;
  let colorClass = "text-primary bg-primary/10";
  let borderClass = "border-gray-200 bg-white";
  let badgeLabel = index !== undefined ? (index + 1).toString() : "";

  if (isFixedStart) {
    Icon = MapPin;
    colorClass = "text-green-600 bg-green-100";
    borderClass = "border-green-300 bg-green-50/40";
    badgeLabel = "A";
  } else if (isFixedEnd) {
    Icon = Flag;
    colorClass = "text-red-600 bg-red-100";
    borderClass = "border-red-300 bg-red-50/40";
    badgeLabel = "Z";
  }
  
  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`p-4 rounded-lg border ${borderClass} relative`}
    >
      {(isFixedStart || isFixedEnd) && (
        <div className={`absolute top-0 right-0 rounded-bl-lg rounded-tr-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isFixedStart ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {isFixedStart ? 'Local de Início' : 'Local de Término'}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full relative ${colorClass}`}>
            <Icon className="h-5 w-5" />
            <div className={`absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ${isFixedStart ? 'bg-green-600' : isFixedEnd ? 'bg-red-600' : 'bg-primary'}`}>
              {badgeLabel}
            </div>
          </div>
          <div>
            <div className="font-medium">
              {stop.type.toUpperCase()} #{stop.service_id}
            </div>
            <div className="text-sm text-gray-500">
              {stop.customer_name}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1 max-w-[300px]">
              {stop.address}
            </div>
            {stop.observations && (
              <div className="text-xs text-gray-400 mt-1 italic">
                Obs: {stop.observations}
              </div>
            )}
            {stop.time_window && (
              <div className="text-sm text-gray-500">
                {stop.time_window}
              </div>
            )}
          </div>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(stop.id)}
            disabled={disabled || isInProgressOrCompleted}
          >
            Remover
          </Button>
        )}
      </div>
    </div>
  );
};
