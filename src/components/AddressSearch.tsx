import { useRef, useEffect } from "react";
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

  useEffect(() => {
    // Verificar se o Google Maps está carregado
    if (!window.google) {
      console.warn("Google Maps not loaded");
      return;
    }
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      onChange(place.formatted_address || "");
      onLocationSelect({ lat, lng }, place.formatted_address || "");
    }
  };

  // Se o Google Maps não estiver carregado, retorna apenas o input
  if (!window.google) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o endereço (Google Maps não carregado)"
        disabled
      />
    );
  }

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