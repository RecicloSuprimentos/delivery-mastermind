import { useState, useEffect } from "react";
import type { Location } from "@/types/routes";

export const useMapConfiguration = (settings?: { 
  operational_base_latitude?: number; 
  operational_base_longitude?: number;
}) => {
  const [center] = useState<Location>({ 
    lat: settings?.operational_base_latitude || -23.5505, 
    lng: settings?.operational_base_longitude || -46.6333 
  });

  useEffect(() => {
    console.log("Settings received:", settings);
    console.log("Google Maps API Key:", settings?.google_maps_key);
    console.log("Window google object:", window.google);
  }, [settings]);

  const mapOptions: google.maps.MapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "cooperative",
    disableDefaultUI: false,
    clickableIcons: false,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP
    }
  };

  return { center, mapOptions };
};