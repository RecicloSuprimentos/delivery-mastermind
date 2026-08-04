import { Navigation } from "@/components/Navigation";
import { RoutesList } from "@/components/routes/RoutesList";

const RoutesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-[73px]">
        <RoutesList />
      </main>
    </div>
  );
};

export default RoutesPage;