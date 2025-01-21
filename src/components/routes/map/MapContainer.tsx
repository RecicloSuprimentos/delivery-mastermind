import { GoogleMap } from "@react-google-maps/api";
import { useCallback, useState } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultOptions = {
  clickableIcons: false,
  gestureHandling: "cooperative",
  disableDefaultUI: true,
  zoomControl: true,
};

interface MapContainerProps {
  children: React.ReactNode;
  center?: google.maps.LatLngLiteral;
  onLoad?: (map: google.maps.Map) => void;
}

export const MapContainer = ({ children, center, onLoad }: MapContainerProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const handleLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    if (onLoad) onLoad(map);
  }, [onLoad]);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={13}
      center={center}
      options={defaultOptions}
      onLoad={handleLoad}
    >
      {map && children}
    </GoogleMap>
  );
};