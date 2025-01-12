import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';
import { useState, useCallback } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyB30rumsKJs3dV_NZ8N0khyf-n4yWDjQKI";

const mapContainerStyle = {
  width: '100%',
  height: '300px'
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

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        form.setValue('address', place.formatted_address);
      }
    }
  };

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autocomplete);
  }, []);

  return (
    <div className="grid gap-4 p-4 bg-soft-green rounded-lg">
      <div className="grid grid-cols-[2fr,1fr] gap-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Endereço *</FormLabel>
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite o endereço completo"
                      className="bg-white"
                    />
                  </FormControl>
                </Autocomplete>
              </LoadScript>
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

      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
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