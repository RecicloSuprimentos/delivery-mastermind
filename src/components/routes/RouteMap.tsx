import { useEffect, useRef } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

const center = { lat: -23.5505, lng: -46.6333 }; // São Paulo

export const RouteMap = () => {
  const mapRef = useRef<google.maps.Map>();

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  return (
    <div className="h-full rounded-lg overflow-hidden border border-gray-200">
      <GoogleMap
        zoom={12}
        center={center}
        mapContainerClassName="w-full h-full"
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={onLoad}
      >
        {/* Markers e DirectionsRenderer serão adicionados aqui */}
      </GoogleMap>
    </div>
  );
};