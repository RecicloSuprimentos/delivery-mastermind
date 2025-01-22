import { useEffect } from "react";
import type { Location } from "@/types/routes";

interface MapControlsProps {
  map: google.maps.Map | undefined;
  center: Location;
}

export const MapControls = ({ map, center }: MapControlsProps) => {
  useEffect(() => {
    if (!map) return;

    map.setCenter(center);
    map.setZoom(13);
  }, [map, center]);

  return null;
};