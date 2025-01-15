import { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";

interface Location {
  lat: number;
  lng: number;
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
  onLocationSelect: (location: Location, address: string) => void;
}

const AddressSearch = ({ value, onChange, onLocationSelect }: AddressSearchProps) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      onChange(place.formatted_address || "");
      onLocationSelect({ lat, lng }, place.formatted_address || "");
    }
  };

  return (
    <Autocomplete
      onLoad={(autocomplete) => {
        autocompleteRef.current = autocomplete;
      }}
      onPlaceChanged={handlePlaceSelect}
      options={{
        componentRestrictions: { country: "br" },
        types: ["address"]
      }}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o endereço"
      />
    </Autocomplete>
  );
};

export default AddressSearch;