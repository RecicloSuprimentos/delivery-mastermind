import { useRef, useEffect, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Location {
  lat: number;
  lng: number;
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
  onLocationSelect: (location: Location) => void;
}

const AddressSearch = ({ value, onChange, onLocationSelect }: AddressSearchProps) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Buscar a chave da API do Google Maps das configurações
  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("google_maps_key")
        .single();
      
      if (error) {
        console.error("Erro ao buscar configurações:", error);
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    if (settings?.google_maps_key) {
      // Carregar o script do Google Maps com a chave da API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${settings.google_maps_key}&libraries=places`;
      script.async = true;
      script.onload = () => setIsGoogleMapsLoaded(true);
      document.head.appendChild(script);

      return () => {
        // Limpar o script quando o componente for desmontado
        document.head.removeChild(script);
      };
    }
  }, [settings?.google_maps_key]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      // Atualiza o endereço e a localização
      onChange(place.formatted_address || "");
      onLocationSelect({ lat, lng });
    } else {
      console.error("Localização não encontrada no endereço selecionado");
    }
  };

  // Se o Google Maps não estiver carregado, retorna apenas o input
  if (!isGoogleMapsLoaded) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Carregando Google Maps..."
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