
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types/routes";
import { DraggableProvided } from "@hello-pangea/dnd";

interface RouteStopItemProps {
  stop: Service;
  index: number;
  onRemove: (id: string) => void;
  disabled?: boolean;
  provided: DraggableProvided;
}

export const RouteStopItem = ({ 
  stop, 
  index, 
  onRemove, 
  disabled,
  provided 
}: RouteStopItemProps) => {
  // Verifica se o serviço está em andamento ou concluído
  const isInProgressOrCompleted = stop.status === 'in-transit' || stop.status === 'completed';
  
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white p-4 rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-2 rounded-full relative">
            <Package className="h-5 w-5 text-primary" />
            <div className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {index + 1}
            </div>
          </div>
          <div>
            <div className="font-medium">
              {stop.type.toUpperCase()} #{stop.service_id}
            </div>
            <div className="text-sm text-gray-500">
              {stop.customer_name}
            </div>
            <div className="text-sm text-gray-500">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(stop.id)}
          disabled={disabled || isInProgressOrCompleted}
        >
          Remover
        </Button>
      </div>
    </div>
  );
};
