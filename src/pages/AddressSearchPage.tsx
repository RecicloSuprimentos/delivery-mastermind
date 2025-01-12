import { Navigation } from "@/components/Navigation";
import DeliveryCard from "@/components/DeliveryCard";

const AddressSearchPage = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <DeliveryCard />
      </div>
    </div>
  );
};

export default AddressSearchPage;