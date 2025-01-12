import { Navigation } from "@/components/Navigation";
import DeliveryCard from "@/components/DeliveryCard";

const AddressSearchPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto pt-24 px-4">
        <DeliveryCard />
      </div>
    </div>
  );
};

export default AddressSearchPage;