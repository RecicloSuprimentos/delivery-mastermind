import { Input } from "@/components/ui/input";
import ServiceTypeSelector from "./ServiceTypeSelector";

interface ServiceIdFieldProps {
  serviceId: string;
  serviceType: "coleta" | "entrega" | null;
  onServiceIdChange: (value: string) => void;
  onServiceTypeChange: (value: "coleta" | "entrega") => void;
}

const ServiceIdField = ({
  serviceId,
  serviceType,
  onServiceIdChange,
  onServiceTypeChange,
}: ServiceIdFieldProps) => {
  return (
    <div className="flex items-center gap-6">
      <ServiceTypeSelector
        value={serviceType}
        onChange={onServiceTypeChange}
      />
      <div className="flex-1">
        <Input
          value={serviceId}
          onChange={(e) => onServiceIdChange(e.target.value)}
          placeholder="ID do serviço (opcional)"
        />
      </div>
    </div>
  );
};

export default ServiceIdField;