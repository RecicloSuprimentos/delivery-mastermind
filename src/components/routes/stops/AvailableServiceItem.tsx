import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types/routes";

interface AvailableServiceItemProps {
  service: Service;
  onAdd: (service: Service) => void;
  disabled?: boolean;
}

export const AvailableServiceItem = ({ 
  service, 
  onAdd, 
  disabled 
}: AvailableServiceItemProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
            {service.observations && (
              <div className="text-xs text-gray-400 mt-1 italic">
                Obs: {service.observations}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAdd(service)}
          disabled={disabled}
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
};