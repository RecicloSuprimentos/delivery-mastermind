import { useState, useEffect } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";
import { AddressSearchInput } from "./address/AddressSearchInput";

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
  const { settings, initializeGoogleMaps } = useGoogleMaps();
  const { 
    inputRef, 
    isLoading, 
    setIsLoading, 
    initializeAutocomplete 
  } = useAddressAutocomplete({ onAddressSelect });

  useEffect(() => {
    if (!settings?.google_maps_key) return;
    
    const initialize = async () => {
      await initializeGoogleMaps();
      initializeAutocomplete();
    };

    initialize();
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (isLoading) setIsLoading(false);
  };

  return (
    <AddressSearchInput
      ref={inputRef}
      value={searchInput}
      onChange={handleInputChange}
      isLoading={isLoading}
      disabled={disabled}
    />
  );
};