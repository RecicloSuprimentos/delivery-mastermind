
import { useState } from "react";
import { Card } from "../ui/card";
import type { AgentData } from "@/types/monitoring";
import { ShoppingCart, Truck, Check, LocateFixed, MapPin } from "lucide-react";
import { ServiceDetailsDialog } from "../service/ServiceDetailsDialog";
import { cn } from "@/lib/utils";

interface AgentsListProps {
  agents: AgentData[];
}

export const AgentsList = ({ agents }: AgentsListProps) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <Card key={agent.id} className="p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full",
                  agent.status === "online" && "bg-green-500",
                  agent.status === "offline" && "bg-gray-400",
                  agent.status === "in-transit" && "bg-blue-500",
                  agent.status === "arrived" && "bg-purple-500"
                )}
                aria-label={`Status: ${agent.status}`}
              />
              <h3 className="font-medium">{agent.name}</h3>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{agent.completedServices}/{agent.totalServices} serviços</span>
              <span className="text-green-600">{agent.onTimePerformance.toFixed(0)}% no prazo</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {agent.timeline.map((stop) => (
              <div
                key={stop.id}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer",
                  "hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "outline-none",
                  stop.status === "completed" && "bg-green-50 border-green-200",
                  stop.status === "cancelled" && "bg-red-50 border-red-200",
                  stop.status === "current" && "bg-blue-50 border-blue-200",
                  stop.status === "pending" && "bg-gray-50 border-gray-200"
                )}
                onClick={() => setSelectedServiceId(stop.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedServiceId(stop.id);
                  }
                }}
                aria-label={`Serviço ${stop.serviceNumber} - ${stop.status}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {stop.type === "coleta" ? (
                      <ShoppingCart 
                        className="h-4 w-4 text-green-600"
                        aria-label="Coleta"
                      />
                    ) : (
                      <Truck 
                        className="h-4 w-4 text-blue-600"
                        aria-label="Entrega"
                      />
                    )}
                    <span className="font-medium">
                      #{stop.serviceNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {stop.status === "completed" && (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Concluído</span>
                      </>
                    )}
                    {stop.status === "current" && (
                      <>
                        <LocateFixed className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600">Atual</span>
                      </>
                    )}
                    {stop.status === "pending" && (
                      <span className="text-gray-500">Pendente</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{stop.address}</span>
                </div>

                {stop.timeWindow && (
                  <div className="mt-1 text-sm text-gray-500">
                    {stop.timeWindow}
                  </div>
                )}

                {stop.estimatedTime && (
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500">Previsto: </span>
                    {stop.estimatedTime}
                    {stop.actualTime && (
                      <>
                        <span className="text-gray-500 mx-1">•</span>
                        <span className="text-gray-500">Realizado: </span>
                        {stop.actualTime}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <ServiceDetailsDialog
        isOpen={!!selectedServiceId}
        onClose={() => setSelectedServiceId(null)}
        serviceId={selectedServiceId}
      />
    </div>
  );
};
