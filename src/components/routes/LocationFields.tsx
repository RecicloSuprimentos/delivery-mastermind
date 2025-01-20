import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
}

interface LocationFieldsProps {
  label: string;
  locationType: "operational_base" | "service";
  onLocationTypeChange: (value: "operational_base" | "service") => void;
  selectedService?: string;
  onServiceChange: (value: string) => void;
  services?: Service[];
  disabled?: boolean;
}

export const LocationFields = ({
  label,
  locationType,
  onLocationTypeChange,
  selectedService,
  onServiceChange,
  services,
  disabled,
}: LocationFieldsProps) => {
  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <RadioGroup
        value={locationType}
        onValueChange={onLocationTypeChange}
        className="flex items-center space-x-4"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="operational_base" id={`${label}-base`} />
          <Label htmlFor={`${label}-base`}>Base Operacional</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="service" id={`${label}-service`} />
          <Label htmlFor={`${label}-service`}>Serviço</Label>
        </div>
      </RadioGroup>
      {locationType === "service" && (
        <Select 
          value={selectedService} 
          onValueChange={onServiceChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white mt-2">
            <SelectValue placeholder="Selecione um serviço" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {services?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.type === "coleta" ? "🔸" : "🔹"} {service.type.toUpperCase()} {service.service_id} - {service.customer_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};