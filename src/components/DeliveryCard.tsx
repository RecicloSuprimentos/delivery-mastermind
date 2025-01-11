import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DeliveryCardProps {
  code: string;
  customer: string;
  address: string;
  status: "success" | "closed" | "pending";
}

export const DeliveryCard = ({ code, customer, address, status }: DeliveryCardProps) => {
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
    <Card className="p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="bg-muted p-2 rounded-full">
          <User className="h-6 w-6 text-secondary" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm">ENTREGA {code}</h3>
            <input type="checkbox" className="rounded border-gray-300" />
          </div>
          <p className="text-sm font-medium mt-1">{customer}</p>
          <p className="text-sm text-secondary mt-1">{address}</p>
          <div className="mt-2 flex justify-end">
            {getStatusBadge()}
          </div>
        </div>
      </div>
    </Card>
  );
};