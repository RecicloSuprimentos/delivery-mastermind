import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const SettingsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => navigate('/')}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};