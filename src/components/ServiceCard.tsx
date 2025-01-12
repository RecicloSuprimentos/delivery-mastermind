import { useState } from "react";
import { MapPinHouse, Phone, Clock, FileEdit, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "./ui/card";

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  phone: string;
  email?: string;
  complement?: string;
  time_window?: string;
  observations?: string;
  status: string;
}

interface ServiceCardProps {
  service: Service;
  onUpdate: () => void;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-3 overflow-hidden bg-white">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium text-lg">
              {service.type.toUpperCase()} {service.service_id}
            </div>
            <div className="font-medium text-lg">{service.customer_name}</div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <MapPinHouse className="h-4 w-4" />
          <span className="text-sm">{service.address}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span className="text-sm">{service.phone}</span>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {service.time_window && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{service.time_window}</span>
              </div>
            )}
            
            {service.observations && (
              <div className="flex items-start gap-2 text-gray-600">
                <FileEdit className="h-4 w-4 mt-1" />
                <span className="text-sm">{service.observations}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceCard;