import { MapPin, MoreVertical, Phone, Clock, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DeliveryCardProps {
  code: string;
  customer: string;
  address: string;
  phone: string;
  timeWindow?: string;
  notes?: string;
  status: "not-assigned" | "assigned" | "accepted" | "in-transit" | "arrived" | "completed";
}

export const DeliveryCard = ({ 
  code, 
  customer, 
  address, 
  phone, 
  timeWindow,
  notes,
  status 
}: DeliveryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case "not-assigned":
        return <Badge className="bg-success text-white">Não atribuído</Badge>;
      case "assigned":
        return <Badge className="bg-primary">Atribuído</Badge>;
      case "accepted":
        return <Badge className="bg-info">Aceito</Badge>;
      case "in-transit":
        return <Badge className="bg-warning">Em trânsito</Badge>;
      case "arrived":
        return <Badge className="bg-success">Chegou</Badge>;
      case "completed":
        return <Badge className="bg-success">Finalizado</Badge>;
    }
  };

  return (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow bg-white">
      <div className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-primary">ENTREGA {code}</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-base font-medium mt-1">{customer}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
            <p className="text-sm text-secondary flex-1">{address}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-secondary flex-shrink-0" />
            <p className="text-sm text-secondary">{phone}</p>
          </div>

          {isExpanded && timeWindow && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-secondary flex-shrink-0" />
              <p className="text-sm text-secondary">{timeWindow}</p>
            </div>
          )}

          {isExpanded && notes && (
            <div className="flex items-start space-x-2">
              <Edit className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
              <p className="text-sm text-secondary flex-1">{notes}</p>
            </div>
          )}
          
          <div className="flex justify-end items-center mt-2">
            {getStatusBadge()}
          </div>
        </div>
      </div>
    </Card>
  );
};