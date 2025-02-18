
import { RouteForm } from "@/components/routes/RouteForm";
import { useEditRoute } from "@/hooks/routes/useEditRoute";

const EditRoutePage = () => {
  const { handleSave, isLoading, route } = useEditRoute();

  return (
    <div className="min-h-screen bg-background px-8">
      <RouteForm onSave={handleSave} isLoading={isLoading} initialData={route} />
    </div>
  );
};

export default EditRoutePage;
