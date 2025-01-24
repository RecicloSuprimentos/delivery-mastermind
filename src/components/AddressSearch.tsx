import { useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("google_maps_key")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!settings?.google_maps_key || !inputRef.current) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${settings.google_maps_key}&libraries=places`;
    script.async = true;
    
    script.onload = () => {
      if (!inputRef.current) return;
      
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "br" },
        fields: ["formatted_address", "geometry"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          onChange(place.formatted_address || "");
          onLocationSelect({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      });
    };

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [settings?.google_maps_key, onChange, onLocationSelect]);

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