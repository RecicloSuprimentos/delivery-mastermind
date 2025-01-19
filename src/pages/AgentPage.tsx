import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Package, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Route {
  id: string;
  name: string;
  start_time: string;
  total_distance: number;
  total_duration: number;
  services: {
    id: string;
    type: "coleta" | "entrega";
    service_id: string;
    customer_name: string;
    address: string;
    time_window?: string;
  }[];
}

const AgentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['agent-routes'],
    queryFn: async () => {
      const { data: routesData, error } = await supabase
        .from("routes")
        .select(`
          id,
          name,
          start_time,
          total_distance,
          total_duration,
          route_stops (
            service:services (
              id,
              type,
              service_id,
              customer_name,
              address,
              time_window
            )
          )
        `)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching routes:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as rotas",
        });
        return [];
      }

      return routesData.map(route => ({
        ...route,
        services: route.route_stops
          .map(stop => stop.service)
          .filter(Boolean)
          .sort((a, b) => a.service_id.localeCompare(b.service_id))
      }));
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Roterizador</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando rotas...</div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma rota encontrada
            </div>
          ) : (
            routes.map((route) => (
              <Card key={route.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">{route.name}</h2>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(route.start_time).toLocaleDateString()} às{" "}
                          {new Date(route.start_time).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {route.total_distance?.toFixed(1)} km
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/agent/route/${route.id}`)}>
                      Ver Detalhes
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {route.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Package className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-medium">
                            {service.type === "coleta" ? "Coleta" : "Entrega"}{" "}
                            #{service.service_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {service.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {service.address}
                          </div>
                          {service.time_window && (
                            <div className="text-sm text-gray-500">
                              {service.time_window}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentPage;