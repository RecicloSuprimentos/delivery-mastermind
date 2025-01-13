import { Input } from "@/components/ui/input";
import AddressSearch from "./AddressSearch";
import InputMask from 'react-input-mask';

interface Location {
  lat: number;
  lng: number;
}

interface AddressFieldsProps {
  address: string;
  onAddressChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
  complement: string;
  onComplementChange: (value: string) => void;
  timeWindow: string;
  onTimeWindowChange: (value: string) => void;
}

const AddressFields = ({
  address,
  onAddressChange,
  onLocationSelect,
  complement,
  onComplementChange,
  timeWindow,
  onTimeWindowChange,
}: AddressFieldsProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Endereço</label>
        <AddressSearch
          value={address}
          onChange={onAddressChange}
          onLocationSelect={onLocationSelect}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Complemento</label>
          <Input
            value={complement}
            onChange={(e) => onComplementChange(e.target.value)}
            placeholder="Apartamento, sala, etc."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Janela de Horário</label>
          <InputMask
            mask="99:99 às 99:99"
            value={timeWindow}
            onChange={(e) => onTimeWindowChange(e.target.value)}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                placeholder="14:00 às 18:00"
              />
            )}
          </InputMask>
        </div>
      </div>
    </div>
  );
};

export default AddressFields;