
import { MapPin, Phone, Clock, FileEdit, User } from "lucide-react";

interface ServiceCardDetailsProps {
  address: string;
  phone: string;
  timeWindow?: string;
  observations?: string;
  isExpanded: boolean;
  status?: string;
  agentName?: string;
}

export const ServiceCardDetails = ({
  address,
  phone,
  timeWindow,
  observations,
  isExpanded,
  status,
  agentName
}: ServiceCardDetailsProps) => {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-600 mb-1">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="text-sm">{address}</span>
      </div>

      <div className="flex items-center gap-2 text-gray-600">
        <Phone className="h-4 w-4 shrink-0" />
        <span className="text-sm">{phone}</span>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 border-t pt-2">
          {status !== "not-assigned" && agentName && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4 shrink-0" />
              <span className="text-sm">Agente: {agentName}</span>
            </div>
          )}
          
          {timeWindow && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="text-sm">{timeWindow}</span>
            </div>
          )}
          
          {observations && (
            <div className="flex items-start gap-2 text-gray-600">
              <FileEdit className="h-4 w-4 mt-1 shrink-0" />
              <span className="text-sm">{observations}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
