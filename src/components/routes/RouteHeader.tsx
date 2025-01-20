import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RouteHeaderProps {
  isViewMode?: boolean;
  onClose?: () => void;
}

export const RouteHeader = ({ isViewMode, onClose }: RouteHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">
        {isViewMode ? "Visualizar Rota" : "Criar Rota"}
      </h1>
      {isViewMode && onClose && (
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};