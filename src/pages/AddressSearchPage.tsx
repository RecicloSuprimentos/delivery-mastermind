import { Navigation } from "@/components/Navigation";
import DeliveryCard from "@/components/DeliveryCard";

const AddressSearchPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto pt-24 px-4">
        <DeliveryCard 
          code="TEST123"
          customer="John Doe"
          address="123 Main St"
          phone="(555) 123-4567"
          status="not-assigned"
        />
      </div>
    </div>
  );
};

export default AddressSearchPage;