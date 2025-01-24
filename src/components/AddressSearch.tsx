import { useEffect, useRef, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Buscar a chave da API do Google Maps
  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("google_maps_key")
        .single();
      
      if (error) {
        console.error("Erro ao buscar configurações:", error);
        setError("Erro ao carregar configurações");
        throw error;
      }
      return data;
    },
  });

  // Carregar o script do Google Maps
  useEffect(() => {
    if (!settings?.google_maps_key) return;

    const googleMapsScript = document.createElement("script");
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${settings.google_maps_key}&libraries=places`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    googleMapsScript.onload = () => {
      setIsLoading(false);
      initializeAutocomplete();
    };

    googleMapsScript.onerror = () => {
      setError("Erro ao carregar Google Maps");
      setIsLoading(false);
    };

    document.head.appendChild(googleMapsScript);

    return () => {
      document.head.removeChild(googleMapsScript);
    };
  }, [settings?.google_maps_key]);

  // Inicializar o autocomplete
  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "br" },
      fields: ["formatted_address", "geometry"],
      types: ["address"]
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        onChange(place.formatted_address || "");
        onLocationSelect({ lat, lng });
      }
    });
  };

  if (error) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Erro ao carregar busca de endereços"
        className="bg-red-50"
      />
    );
  }

  if (isLoading) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Carregando busca de endereços..."
        disabled
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Digite o endereço"
    />
  );
};

export default AddressSearch;