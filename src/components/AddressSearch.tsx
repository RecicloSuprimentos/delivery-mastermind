import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddressSearchProps {
  onAddressSelect: (address: string, latitude: number, longitude: number) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export const AddressSearch = ({ 
  onAddressSelect, 
  defaultValue = "", 
  disabled = false 
}: AddressSearchProps) => {
  const [searchInput, setSearchInput] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: settings } = useQuery({
    queryKey: ["system_settings"],
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

  const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => {
        reject(new Error("Erro ao carregar o Google Maps"));
      };

      document.head.appendChild(script);
    });
  };

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

  useEffect(() => {
    if (!settings?.google_maps_key) return;

    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMapsScript(settings.google_maps_key);
        initializeAutocomplete();
      } catch (error) {
        console.error("Erro ao carregar Google Maps:", error);
        toast.error("Erro ao carregar serviço de busca de endereços");
      }
    };

    initializeGoogleMaps();
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (isLoading) setIsLoading(false);
  };

  return (
    <Input
      ref={inputRef}
      id="address-search"
      type="text"
      placeholder={isLoading ? "Carregando..." : "Digite o endereço para buscar"}
      value={searchInput}
      onChange={handleInputChange}
      disabled={disabled || isLoading}
      className={isLoading ? "opacity-70" : ""}
    />
  );
};