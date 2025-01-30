import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRouteName } from "@/utils/routeNameUtils";

interface RouteNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const RouteNameField = ({ value, onChange, disabled }: RouteNameFieldProps) => {
  useEffect(() => {
    // Apenas sugere um nome se o campo estiver vazio
    if (!value) {
      onChange(generateRouteName());
    }
  }, [value, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.toUpperCase());
  };

  return (
    <div>
      <Label>Nome da Rota</Label>
      <Input 
        placeholder="Digite o nome da rota" 
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};