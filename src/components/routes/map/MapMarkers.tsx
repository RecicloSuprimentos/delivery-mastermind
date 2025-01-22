import { Marker } from "@react-google-maps/api";
import type { Service, SystemSettings } from "@/types/routes";

interface MapMarkersProps {
  settings?: SystemSettings;
  selectedStops: Service[];
  startLocationType: "operational_base" | "service";
  endLocationType: "operational_base" | "service";
  selectedStartService?: Service;
  selectedEndService?: Service;
}

export const MapMarkers = ({ 
  settings, 
  selectedStops,
  startLocationType,
  endLocationType,
  selectedStartService,
  selectedEndService 
}: MapMarkersProps) => {
  return (
    <>
      {settings && startLocationType === "operational_base" && (
        <Marker
          position={{
            lat: Number(settings.operational_base_latitude),
            lng: Number(settings.operational_base_longitude),
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#0EA5E9",
            fillOpacity: 1,
            strokeColor: "#0369A1",
            strokeWeight: 2,
          }}
          label="Base"
        />
      )}

      {selectedStops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={{ lat: Number(stop.latitude), lng: Number(stop.longitude) }}
          label={`${index + 1}`}
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