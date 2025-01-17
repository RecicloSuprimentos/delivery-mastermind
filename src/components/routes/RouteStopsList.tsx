import { Package, MapPin, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const RouteStopsList = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Paradas da Rota</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Inverter
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Otimizar
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Lista de paradas será renderizada aqui */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Coleta #357357</div>
                <div className="text-sm text-gray-500">João Silva</div>
                <div className="text-sm text-gray-500">Rua Example, 123</div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>5,6 km</div>
              <div>9 min</div>
              <div>08:09 – 08:14</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
        <div>
          <div>Distância total: 10,5 km</div>
          <div>Tempo total: 28 min</div>
        </div>
        <div>3 paradas</div>
      </div>
    </div>
  );
};