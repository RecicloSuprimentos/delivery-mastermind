import { Input } from "@/components/ui/input";
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
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddressChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-sm font-medium">Endereço</label>
        <Input
          required
          value={address}
          onChange={handleAddressChange}
          placeholder="Digite o endereço"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Complemento</label>
          <Input
            value={complement}
            onChange={(e) => onComplementChange(e.target.value)}
            placeholder="Apto, sala, etc."
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Janela de Horário</label>
          <InputMask
            mask="99:99 - 99:99"
            value={timeWindow}
            onChange={(e) => onTimeWindowChange(e.target.value)}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                placeholder="00:00 - 00:00"
              />
            )}
          </InputMask>
        </div>
      </div>
    </div>
  );
};

export default AddressFields;