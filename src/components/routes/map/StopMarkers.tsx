import { Marker } from "@react-google-maps/api";

interface Stop {
  location: google.maps.LatLngLiteral;
  label: string;
}

interface StopMarkersProps {
  stops: Stop[];
}

export const StopMarkers = ({ stops }: StopMarkersProps) => {
  return (
    <>
      {stops.map((stop, index) => (
        <Marker
          key={index}
          position={stop.location}
          label={{
            text: stop.label,
            color: "white",
            fontWeight: "bold",
          }}
        />
      ))}
    </>
  );
};