
import { RouteForm } from "@/components/routes/RouteForm";
import { useCreateRoute } from "@/hooks/routes/useCreateRoute";

const CreateRoutePage = () => {
  const { handleSave, isLoading } = useCreateRoute();

  return (
    <div className="min-h-screen bg-background px-8">
      <RouteForm onSave={handleSave} isLoading={isLoading} />
    </div>
  );
};

export default CreateRoutePage;
