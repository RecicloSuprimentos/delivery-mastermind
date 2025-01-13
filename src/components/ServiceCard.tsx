import { useState } from "react";
import { MapPin, Phone, Clock, FileEdit, ChevronDown, ChevronUp } from "lucide-react";
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
    <Card className="mb-2 overflow-hidden bg-white">
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <div>
            <div className="font-medium text-base">
              {service.type.toUpperCase()} {service.service_id}
            </div>
            <div className="font-medium text-base">{service.customer_name}</div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="text-sm">{service.address}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4 shrink-0" />
          <span className="text-sm">{service.phone}</span>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-2 border-t pt-2">
            {service.time_window && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm">{service.time_window}</span>
              </div>
            )}
            
            {service.observations && (
              <div className="flex items-start gap-2 text-gray-600">
                <FileEdit className="h-4 w-4 mt-1 shrink-0" />
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