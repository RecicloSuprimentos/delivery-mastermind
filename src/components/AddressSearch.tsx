import { useEffect, useState } from "react";
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

  // Buscar a chave da API do Google Maps
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

  useEffect(() => {
    if (!settings?.google_maps_key) {
      console.log("Chave do Google Maps não encontrada");
      return;
    }

    // Carregar o script do Google Maps apenas uma vez
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${settings.google_maps_key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      script.onerror = () => {
        console.error("Erro ao carregar o script do Google Maps");
        toast.error("Erro ao carregar o serviço de busca de endereços");
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else if (window.google) {
      initializeAutocomplete();
    }
  }, [settings]);

  const initializeAutocomplete = () => {
    try {
      if (!window.google) {
        console.error("Google Maps não está disponível");
        return;
      }

      const input = document.getElementById("address-search") as HTMLInputElement;
      if (!input) return;

      const options = {
        componentRestrictions: { country: "br" },
        types: ["address"],
      };

      const autocomplete = new google.maps.places.Autocomplete(input, options);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        setIsLoading(true);
        
        if (!place.geometry?.location) {
          toast.error("Endereço inválido selecionado");
          setIsLoading(false);
          return;
        }

        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();
        const address = place.formatted_address || "";

        onAddressSelect(address, latitude, longitude);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Erro ao inicializar autocompletar:", error);
      toast.error("Erro ao inicializar busca de endereços");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    // Não bloquear a interface durante a digitação
    if (isLoading) {
      setIsLoading(false);
    }
  };

  return (
    <Input
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