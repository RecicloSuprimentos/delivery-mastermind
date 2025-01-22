import { DirectionsRenderer } from "@react-google-maps/api";

interface MapDirectionsProps {
  directions: google.maps.DirectionsResult | null;
}

export const MapDirections = ({ directions }: MapDirectionsProps) => {
  if (!directions) return null;

  return (
    <DirectionsRenderer
      directions={directions}
      options={{
        suppressMarkers: true,
        preserveViewport: false,
        polylineOptions: {
          strokeColor: "#0EA5E9",
          strokeWeight: 5,
          strokeOpacity: 0.7,
        },
      }}
    />
  );
};