import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RouteFormHeaderProps {
  onSave: () => void;
  isLoading: boolean;
  routeId?: string | null;
  isViewMode?: boolean;
}

export const RouteFormHeader = ({ onSave, isLoading, routeId, isViewMode }: RouteFormHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/routes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">
          {routeId ? (isViewMode ? "Visualizar Rota" : "Editar Rota") : "Nova Rota"}
        </h1>
      </div>
      {!isViewMode && (
        <Button 
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      )}
    </div>
  );
};