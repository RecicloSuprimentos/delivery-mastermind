import { Card, CardContent } from "@/components/ui/card";

interface DeliveryCardProps {
  code: string;
  customer: string;
  address: string;
  phone: string;
  status: "not-assigned" | "assigned" | "accepted" | "in-transit" | "arrived" | "completed";
}

const DeliveryCard = ({ code, customer, address, phone, status }: DeliveryCardProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold">{customer}</h3>
            <span className="text-sm text-muted-foreground">#{code}</span>
          </div>
          <p className="text-sm text-muted-foreground">{address}</p>
          <p className="text-sm text-muted-foreground">{phone}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {status.replace('-', ' ')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryCard;