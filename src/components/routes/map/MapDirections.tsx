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
      }}
    />
  );
};