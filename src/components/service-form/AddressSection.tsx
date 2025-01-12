import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";
import { GoogleMap, LoadScript, Autocomplete, Libraries } from '@react-google-maps/api';
import { useState, useRef } from "react";
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = "AIzaSyB30rumsKJs3dV_NZ8N0khyf-n4yWDjQKI";

const libraries: Libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333
};

interface AddressSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const AddressSection = ({ form }: AddressSectionProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePlaceSelect = () => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.formatted_address) {
      toast.error("Por favor, selecione um endereço da lista de sugestões");
      return;
    }

    // Atualiza o formulário com o endereço selecionado
    form.setValue('address', place.formatted_address, {
      shouldValidate: true
    });

    // Atualiza o mapa
    if (map) {
      // Remove o marcador anterior se existir
      if (marker) {
        marker.setMap(null);
      }

      // Centraliza o mapa na nova localização
      const location = place.geometry.location;
      map.panTo(location);
      map.setZoom(16);

      // Adiciona um novo marcador
      const newMarker = new google.maps.Marker({
        map,
        position: location,
        animation: google.maps.Animation.DROP
      });
      setMarker(newMarker);

      toast.success("Endereço selecionado com sucesso!");
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Endereço *</FormLabel>
            <FormControl>
              <LoadScript 
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                libraries={libraries}
              >
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
                    {...field}
                    ref={inputRef}
                    placeholder="Digite o endereço para buscar"
                    className="bg-white"
                  />
                </Autocomplete>
              </LoadScript>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={13}
          onLoad={(map) => setMap(map)}
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