import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import type { Service } from "@/types/routes";

interface MapComponentProps {
  services: Service[];
}

export const MapComponent = ({ services }: MapComponentProps) => {
  const [center, setCenter] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo

  const { data: settings } = useQuery({
    queryKey: ["system_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (services.length > 0 && services[0].latitude && services[0].longitude) {
      setCenter({ lat: services[0].latitude, lng: services[0].longitude });
    } else if (settings?.operational_base_latitude && settings?.operational_base_longitude) {
      setCenter({
        lat: settings.operational_base_latitude,
        lng: settings.operational_base_longitude,
      });
    }
  }, [services, settings]);

  if (!settings?.google_maps_key) {
    return <div className="h-full flex items-center justify-center">Chave do Google Maps não configurada</div>;
  }

  return (
    <LoadScript googleMapsApiKey={settings.google_maps_key}>
      <GoogleMap
        mapContainerClassName="w-full h-full rounded-lg"
        center={center}
        zoom={12}
      >
        {services.map((service) => (
          <Marker
            key={service.id}
            position={{ lat: service.latitude, lng: service.longitude }}
            title={service.customer_name}
          />
        ))}
        {settings?.operational_base_latitude && settings?.operational_base_longitude && (
          <Marker
            position={{
              lat: settings.operational_base_latitude,
              lng: settings.operational_base_longitude,
            }}
            title="Base Operacional"
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};