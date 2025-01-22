import { Marker } from "@react-google-maps/api";
import type { Service, SystemSettings } from "@/types/routes";

interface MapMarkersProps {
  startLocationType: string;
  settings?: SystemSettings;
  selectedStops: Service[];
}

export const MapMarkers = ({ startLocationType, settings, selectedStops }: MapMarkersProps) => {
  return (
    <>
      {settings && startLocationType === "operational_base" && (
        <Marker
          position={{
            lat: settings.operational_base_latitude,
            lng: settings.operational_base_longitude,
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#0EA5E9",
            fillOpacity: 1,
            strokeColor: "#0369A1",
            strokeWeight: 2,
          }}
          label={{
            text: "Base",
            color: "#FFFFFF"
          }}
        />
      )}

      {selectedStops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={{ lat: stop.latitude, lng: stop.longitude }}
          label={{
            text: `${index + 1}`,
            color: "#FFFFFF",
            fontWeight: "bold"
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: stop.type === "coleta" ? "#F97316" : "#9333EA",
            fillOpacity: 1,
            strokeColor: stop.type === "coleta" ? "#C2410C" : "#6B21A8",
            strokeWeight: 2,
          }}
        />
      ))}
    </>
  );
};