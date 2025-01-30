import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RouteStopItem } from "./stops/RouteStopItem";
import { AvailableServiceItem } from "./stops/AvailableServiceItem";
import { RouteStopsHeader } from "./stops/RouteStopsHeader";
import { useRouteStops } from "./stops/useRouteStops";
import type { Service } from "@/types/routes";

interface RouteStopsListProps {
  services: Service[];
  selectedStops: Service[];
  onStopsChange: (stops: Service[]) => void;
  onOptimize?: () => void;
  disabled?: boolean;
}

export const RouteStopsList = ({ 
  services,
  selectedStops,
  onStopsChange,
  onOptimize,
  disabled,
}: RouteStopsListProps) => {
  const {
    handleAddStop,
    handleAddAllStops,
    handleRemoveStop,
    handleInvertStops,
    getAvailableServices,
  } = useRouteStops({
    services,
    selectedStops,
    onStopsChange,
    disabled,
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination || disabled) return;

    const items = Array.from(selectedStops);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onStopsChange(items);
  };

  const availableServices = getAvailableServices();

  return (
    <div className="space-y-4">
      <RouteStopsHeader
        onOptimize={onOptimize || (() => {})}
        onInvert={() => {
          handleInvertStops();
          // Força o recálculo da rota após inverter
          if (onOptimize) {
            setTimeout(onOptimize, 0);
          }
        }}
        onAddAll={handleAddAllStops}
        disabled={disabled}
        hasAvailableServices={availableServices.length > 0}
      />

      <div className="space-y-2">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stops">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {selectedStops.map((stop, index) => (
                  <Draggable 
                    key={stop.id} 
                    draggableId={stop.id} 
                    index={index}
                    isDragDisabled={disabled}
                  >
                    {(provided) => (
                      <RouteStopItem
                        stop={stop}
                        index={index}
                        onRemove={handleRemoveStop}
                        disabled={disabled}
                        provided={provided}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Serviços Disponíveis</h3>
        {availableServices.map(service => (
          <AvailableServiceItem
            key={service.id}
            service={service}
            onAdd={handleAddStop}
            disabled={disabled}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
        <div>
          <div>Paradas selecionadas: {selectedStops.length}</div>
          <div>Serviços disponíveis: {availableServices.length}</div>
        </div>
      </div>
    </div>
  );
};