import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ServiceCardHeaderProps {
  onClose?: () => void;
}

const ServiceCardHeader = ({ onClose }: ServiceCardHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle>Novo Serviço</CardTitle>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};

export default ServiceCardHeader;