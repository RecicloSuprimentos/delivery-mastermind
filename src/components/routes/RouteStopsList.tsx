import { Package, MapPin, ArrowRight, RefreshCw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  time_window?: string;
}

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
  const handleDragEnd = (result: any) => {
    if (!result.destination || disabled) return;

    const items = Array.from(selectedStops);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onStopsChange(items);
  };

  const handleAddStop = (service: Service) => {
    if (!selectedStops.find(s => s.id === service.id) && !disabled) {
      onStopsChange([...selectedStops, service]);
    }
  };

  const handleRemoveStop = (serviceId: string) => {
    if (!disabled) {
      onStopsChange(selectedStops.filter(s => s.id !== serviceId));
    }
  };

  const handleInvertStops = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onStopsChange([...selectedStops].reverse());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Paradas da Rota</h2>
        <div className="space-x-2">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={onOptimize}
            disabled={disabled || !onOptimize}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Otimizar
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={handleInvertStops}
            disabled={disabled}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Inverter
          </Button>
        </div>
      </div>

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
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Package className="h-5 w-5 text-primary" />
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
                            onClick={() => handleRemoveStop(stop.id)}
                            disabled={disabled}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
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
        {services
          .filter(service => !selectedStops.find(s => s.id === service.id))
          .map(service => (
            <div
              key={service.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <Package className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {service.type.toUpperCase()} #{service.service_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.address}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddStop(service)}
                  disabled={disabled}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
        <div>
          <div>Paradas selecionadas: {selectedStops.length}</div>
          <div>Serviços disponíveis: {services.length - selectedStops.length}</div>
        </div>
      </div>
    </div>
  );
};