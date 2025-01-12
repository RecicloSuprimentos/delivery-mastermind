import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = "AIzaSyB30rumsKJs3dV_NZ8N0khyf-n4yWDjQKI";

const mapContainerStyle = {
  width: '100%',
  height: '240px'
};

const center = {
  lat: -23.5505,
  lng: -46.6333
};

interface AddressSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const AddressSection = ({ form }: AddressSectionProps) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearMarker = useCallback(() => {
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }
  }, [marker]);

  useEffect(() => {
    return () => {
      clearMarker();
    };
  }, [clearMarker]);

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    console.log("Autocomplete loaded successfully");
    setAutocomplete(autocomplete);
    setIsLoaded(true);
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded successfully");
    setMap(map);
  }, []);

  const updateMapLocation = useCallback((place: google.maps.places.PlaceResult) => {
    if (!map || !place.geometry?.location) {
      console.warn("Map or location not available");
      return;
    }

    const location = place.geometry.location;
    map.setCenter(location);
    map.setZoom(16);

    clearMarker();

    const newMarker = new google.maps.Marker({
      map,
      position: location,
      animation: google.maps.Animation.DROP
    });

    setMarker(newMarker);
  }, [map, clearMarker]);

  const onPlaceChanged = useCallback(() => {
    if (!autocomplete) {
      console.warn("Autocomplete not initialized");
      return;
    }

    try {
      const place = autocomplete.getPlace();
      console.log("Selected place:", place);

      if (!place.formatted_address) {
        console.warn("No formatted address found");
        toast.error("Por favor, selecione um endereço da lista de sugestões.");
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      console.log("Setting address:", place.formatted_address);

      // Update form value
      form.setValue('address', place.formatted_address, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      // Update input value
      if (inputRef.current) {
        inputRef.current.value = place.formatted_address;
      }

      // Update map
      updateMapLocation(place);

      toast.success("Endereço selecionado com sucesso!");
    } catch (error) {
      console.error("Error handling place selection:", error);
      toast.error("Erro ao selecionar endereço. Por favor, tente novamente.");
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [autocomplete, form, updateMapLocation]);

  // Prevent manual input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only arrow keys, enter, tab, backspace and delete
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Backspace', 'Delete'];
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[2fr,1fr] gap-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Endereço *</FormLabel>
              <FormControl>
                <LoadScript 
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY} 
                  libraries={["places"]}
                  onLoad={() => console.log("Google Maps Script loaded")}
                  onError={(error) => {
                    console.error("Error loading Google Maps:", error);
                    toast.error("Erro ao carregar o mapa. Por favor, recarregue a página.");
                  }}
                >
                  <Autocomplete
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      componentRestrictions: { country: "br" },
                      types: ["address"]
                    }}
                  >
                    <Input
                      {...field}
                      ref={inputRef}
                      placeholder="Clique para buscar um endereço"
                      className="bg-white cursor-pointer"
                      onKeyDown={handleKeyDown}
                      readOnly
                      onClick={() => {
                        if (!isLoaded) {
                          toast.error("Aguarde o carregamento do mapa...");
                        }
                      }}
                    />
                  </Autocomplete>
                </LoadScript>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressComplement"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Complemento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Apto, Sala, etc." className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY} 
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          onLoad={onMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        />
      </LoadScript>
    </div>
  );
};