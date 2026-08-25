import { Marker } from "@react-google-maps/api";
import type { Service, SystemSettings } from "@/types/routes";

interface MapMarkersProps {
  startLocationType: string;
  endLocationType?: string;
  settings?: SystemSettings;
  selectedStops: Service[];
  selectedStartService?: Service;
  selectedEndService?: Service;
}

export const MapMarkers = ({ 
  startLocationType, 
  endLocationType,
  settings, 
  selectedStops,
  selectedStartService,
  selectedEndService
}: MapMarkersProps) => {
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

      {startLocationType === "service" && selectedStartService && (
        <Marker
          position={{ lat: selectedStartService.latitude, lng: selectedStartService.longitude }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#10B981",
            fillOpacity: 1,
            strokeColor: "#047857",
            strokeWeight: 2,
          }}
          label={{ text: "A", color: "#FFFFFF", fontWeight: "bold" }}
          zIndex={100}
        />
      )}

      {endLocationType === "service" && selectedEndService && (
        <Marker
          position={{ lat: selectedEndService.latitude, lng: selectedEndService.longitude }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#EF4444",
            fillOpacity: 1,
            strokeColor: "#B91C1C",
            strokeWeight: 2,
          }}
          label={{ text: "B", color: "#FFFFFF", fontWeight: "bold" }}
          zIndex={100}
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