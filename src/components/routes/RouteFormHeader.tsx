import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RouteFormHeaderProps {
  routeId?: string;
  isViewMode?: boolean;
}

export const RouteFormHeader = ({ routeId, isViewMode }: RouteFormHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">
        {routeId ? (isViewMode ? "Visualizar Rota" : "Editar Rota") : "Criar Rota"}
      </h1>
      <div className="space-x-4">
        <Button variant="outline" onClick={() => navigate("/routes")}>
          {isViewMode ? "Fechar" : "Cancelar"}
        </Button>
        {!isViewMode && <Button type="submit">Salvar</Button>}
      </div>
    </div>
  );
};