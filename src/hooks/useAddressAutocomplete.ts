import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface UseAddressAutocompleteProps {
  onAddressSelect: (address: string, latitude: number, longitude: number) => void;
}

export const useAddressAutocomplete = ({ onAddressSelect }: UseAddressAutocompleteProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || autocompleteRef.current) return;

    try {
      const options = {
        componentRestrictions: { country: "br" },
        types: ["address"],
      };

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      autocompleteRef.current.addListener("place_changed", () => {
        if (!autocompleteRef.current) return;

        setIsLoading(true);
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry?.location) {
          setIsLoading(false);
          toast.error("Endereço inválido selecionado");
          return;
        }

        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();
        const address = place.formatted_address || "";

        onAddressSelect(address, latitude, longitude);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Erro ao inicializar autocomplete:", error);
      toast.error("Erro ao inicializar busca de endereços");
      setIsLoading(false);
    }
  };

  return {
    inputRef,
    isLoading,
    setIsLoading,
    initializeAutocomplete
  };
};