import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface AddressSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const AddressSearchInput = forwardRef<HTMLInputElement, AddressSearchInputProps>(
  ({ value, onChange, isLoading, disabled }, ref) => {
    return (
      <Input
        ref={ref}
        id="address-search"
        type="text"
        placeholder={isLoading ? "Carregando..." : "Digite o endereço para buscar"}
        value={value}
        onChange={onChange}
        disabled={disabled || isLoading}
        className={isLoading ? "opacity-70" : ""}
      />
    );
  }
);

AddressSearchInput.displayName = "AddressSearchInput";