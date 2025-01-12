import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import AddressSearch from "@/components/AddressSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Location {
  lat: number;
  lng: number;
}

const AddressSearchPage = () => {
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Location | null>(null);

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation);
    console.log("Selected location:", newLocation);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto pt-24 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Endereço</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressSearch
              value={address}
              onChange={setAddress}
              onLocationSelect={handleLocationSelect}
            />
            {location && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Localização selecionada:</h3>
                <p>Endereço: {address}</p>
                <p>Latitude: {location.lat}</p>
                <p>Longitude: {location.lng}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddressSearchPage;