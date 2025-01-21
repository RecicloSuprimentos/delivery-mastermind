import { DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState } from "react";

interface RouteDirectionsProps {
  directions: google.maps.DirectionsResult | null;
  onDirectionsChanged?: () => void;
}

export const RouteDirections = ({ directions, onDirectionsChanged }: RouteDirectionsProps) => {
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (directionsRenderer) {
      directionsRenderer.setDirections(directions);
      if (onDirectionsChanged) onDirectionsChanged();
    }
  }, [directions, directionsRenderer, onDirectionsChanged]);

  return directions ? (
    <DirectionsRenderer
      options={{
        suppressMarkers: true,
        preserveViewport: true,
      }}
      onLoad={setDirectionsRenderer}
    />
  ) : null;
};