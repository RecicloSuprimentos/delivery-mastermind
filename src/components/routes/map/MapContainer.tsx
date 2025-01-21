import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Location } from "@/types/routes";

interface MapContainerProps {
  center: Location;
  markers: { position: Location; label?: string }[];
  directions: google.maps.DirectionsResult | null;
}

export const MapContainer = ({ center, markers, directions }: MapContainerProps) => {
  return (
    <GoogleMap
      center={center}
      zoom={12}
      mapContainerStyle={{ width: "100%", height: "100%" }}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          label={marker.label}
        />
      ))}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            preserveViewport: true,
          }}
        />
      )}
    </GoogleMap>
  );
};