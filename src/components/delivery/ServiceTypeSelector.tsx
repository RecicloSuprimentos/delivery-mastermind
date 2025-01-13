import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ServiceTypeSelectorProps {
  value: string;
  onChange: (value: "coleta" | "entrega") => void;
}

const ServiceTypeSelector = ({ value, onChange }: ServiceTypeSelectorProps) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={(value) => onChange(value as "coleta" | "entrega")}
      className="flex items-center gap-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="coleta" id="coleta" />
        <Label htmlFor="coleta">Coleta</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="entrega" id="entrega" />
        <Label htmlFor="entrega">Entrega</Label>
      </div>
    </RadioGroup>
  );
};

export default ServiceTypeSelector;