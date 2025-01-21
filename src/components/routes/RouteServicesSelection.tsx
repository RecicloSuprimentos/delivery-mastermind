import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { Service } from "@/types/routes";

interface RouteServicesSelectionProps {
  services: Service[];
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
}

export const RouteServicesSelection = ({
  services,
  selectedServices,
  onToggleService,
}: RouteServicesSelectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {services?.map((service) => (
        <Card
          key={service.id}
          className={`p-4 cursor-pointer ${
            selectedServices.includes(service.id)
              ? "border-primary border-2"
              : ""
          }`}
          onClick={() => onToggleService(service.id)}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">
                {service.type === "coleta" ? "COLETA" : "ENTREGA"} {service.service_id}
              </div>
              <div className="text-sm text-gray-600">{service.customer_name}</div>
              <div className="text-sm text-gray-600">{service.address}</div>
            </div>
            {selectedServices.includes(service.id) && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};