import AddressSearch from "../AddressSearch";
import { Input } from "@/components/ui/input";

interface Location {
  lat: number;
  lng: number;
}

interface AddressFieldsProps {
  address: string;
  setAddress: (value: string) => void;
  complement: string;
  setComplement: (value: string) => void;
  timeWindow: string;
  setTimeWindow: (value: string) => void;
  onLocationSelect: (location: Location) => void;
}

const AddressFields = ({
  address,
  setAddress,
  complement,
  setComplement,
  timeWindow,
  setTimeWindow,
  onLocationSelect,
}: AddressFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Endereço</label>
        <AddressSearch
          value={address}
          onChange={setAddress}
          onLocationSelect={onLocationSelect}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Complemento</label>
          <Input
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            placeholder="Apartamento, sala, etc."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Janela de Horário</label>
          <Input
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            placeholder="14:00 às 18:00"
          />
        </div>
      </div>
    </>
  );
};

export default AddressFields;