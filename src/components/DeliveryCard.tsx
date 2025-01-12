import { MapPin, MoreVertical, Map } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DeliveryCardProps {
  code: string;
  customer: string;
  address: string;
  phone: string;
  status: "success" | "closed" | "pending";
}

export const DeliveryCard = ({ code, customer, address, phone, status }: DeliveryCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "success":
        return <Badge className="bg-success">Sucesso</Badge>;
      case "closed":
        return <Badge className="bg-destructive">Fechado</Badge>;
      default:
        return <Badge className="bg-secondary">Pendente</Badge>;
    }
  };

  return (
    <Card className="p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow bg-white">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-sm text-primary">ENTREGA {code}</h3>
            <p className="text-sm font-medium mt-1">{customer}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
          <p className="text-xs text-secondary flex-1">{address}</p>
        </div>
        
        <p className="text-sm text-secondary">{phone}</p>
        
        <div className="flex justify-between items-center mt-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Map className="h-4 w-4" />
          </Button>
          {getStatusBadge()}
        </div>
      </div>
    </Card>
  );
};