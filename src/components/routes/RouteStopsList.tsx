import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceCard } from "@/components/ServiceCard";
import type { Service } from "@/types/routes";

interface RouteStopsListProps {
  services: Service[];
  selectedStops: Service[];
  onStopsChange: (stops: Service[]) => void;
  onOptimize: () => void;
  disabled?: boolean;
}

export const RouteStopsList = ({
  services,
  selectedStops,
  onStopsChange,
  onOptimize,
  disabled,
}: RouteStopsListProps) => {
  const handleServiceSelect = (service: Service) => {
    if (selectedStops.find((s) => s.id === service.id)) {
      onStopsChange(selectedStops.filter((s) => s.id !== service.id));
    } else {
      onStopsChange([...selectedStops, service]);
      onOptimize(); // Call optimize immediately when adding a new stop
    }
  };

  const handleRemoveStop = (service: Service) => {
    onStopsChange(selectedStops.filter((s) => s.id !== service.id));
    onOptimize(); // Call optimize immediately when removing a stop
  };

  const availableServices = services.filter(
    (service) => !selectedStops.find((s) => s.id === service.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Paradas da Rota</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onOptimize}
          disabled={disabled || selectedStops.length < 2}
        >
          Otimizar Rota
        </Button>
      </div>

      <ScrollArea className="h-[calc(50vh-8rem)]">
        <div className="space-y-2 pr-4">
          {selectedStops.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              onRemove={disabled ? undefined : () => handleRemoveStop(service)}
              index={index + 1}
            />
          ))}
        </div>
      </ScrollArea>

      <div>
        <h3 className="text-lg font-semibold mb-4">Serviços Disponíveis</h3>
        <ScrollArea className="h-[calc(50vh-12rem)]">
          <div className="space-y-2 pr-4">
            {availableServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={disabled ? undefined : () => handleServiceSelect(service)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};