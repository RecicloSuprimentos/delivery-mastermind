import { Navigation } from "@/components/Navigation";
import { RouteForm } from "@/components/routes/RouteForm";

const CreateRoutePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <RouteForm />
      </main>
    </div>
  );
};

export default CreateRoutePage;