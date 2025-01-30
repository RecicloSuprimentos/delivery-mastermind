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
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // Buscar a chave da API do Google Maps
  const { data: settings, isLoading } = useQuery({
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

    // Carregar o script do Google Maps
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${settings.google_maps_key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      script.onerror = () => {
        console.error("Erro ao carregar o script do Google Maps");
        toast.error("Erro ao carregar o serviço de busca de endereços");
      };
      document.head.appendChild(script);
    };

    // Verificar se o script já está carregado
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
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

      const autocompleteInstance = new google.maps.places.Autocomplete(input, options);
      setAutocomplete(autocompleteInstance);

      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        
        if (!place.geometry?.location) {
          toast.error("Endereço inválido selecionado");
          return;
        }

        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();
        const address = place.formatted_address || "";

        onAddressSelect(address, latitude, longitude);
      });
    } catch (error) {
      console.error("Erro ao inicializar autocompletar:", error);
      toast.error("Erro ao inicializar busca de endereços");
    }
  };

  if (isLoading) {
    return (
      <Input
        type="text"
        placeholder="Carregando busca de endereços..."
        disabled
        value={searchInput}
      />
    );
  }

  return (
    <Input
      id="address-search"
      type="text"
      placeholder="Digite o endereço para buscar"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      disabled={disabled}
    />
  );
};