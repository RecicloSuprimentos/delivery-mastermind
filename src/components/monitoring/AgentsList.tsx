import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, MapPin, Navigation, X } from "lucide-react";
import type { AgentData } from "@/types/monitoring";

interface AgentsListProps {
  agents: AgentData[];
}

export function AgentsList({ agents }: AgentsListProps) {
  const getStatusBadge = (status: AgentData["status"]) => {
    switch (status) {
      case "in-transit":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Navigation className="w-3 h-3 mr-1" />
            Em deslocamento
          </Badge>
        );
      case "arrived":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <MapPin className="w-3 h-3 mr-1" />
            Chegou ao local
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Desconectado
          </Badge>
        );
    }
  };

  const getStopIcon = (status: string, completionOrder?: number) => {
    if (status === "completed") {
      return (
        <div className="relative">
          <Check className="w-4 h-4" />
          {completionOrder && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              {completionOrder}
            </span>
          )}
        </div>
      );
    }
    if (status === "cancelled") {
      return (
        <div className="relative">
          <X className="w-4 h-4" />
          {completionOrder && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              {completionOrder}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          {/* Agent Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-gray-900">{agent.name}</h3>
              {getStatusBadge(agent.status)}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progresso</div>
              <div className="text-lg font-semibold">
                {agent.completedServices}/{agent.totalServices}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress 
            value={agent.totalServices > 0 
              ? (agent.completedServices / agent.totalServices) * 100 
              : 0
            } 
            className="mb-4" 
          />

          {/* Timeline */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {agent.timeline.map((stop) => (
              <div
                key={stop.id}
                className="flex flex-col items-center min-w-[40px]"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    stop.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : stop.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : stop.status === "current"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {stop.status === "completed" || stop.status === "cancelled"
                    ? getStopIcon(stop.status, stop.completionOrder)
                    : stop.serviceNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stop.actualTime || stop.estimatedTime}
                </div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <div className="text-gray-500">Coletas</div>
              <div className="font-semibold">{agent.collections}</div>
            </div>
            <div>
              <div className="text-gray-500">Entregas</div>
              <div className="font-semibold">{agent.deliveries}</div>
            </div>
            <div>
              <div className="text-gray-500">Pendentes</div>
              <div className="font-semibold">{agent.pendingServices}</div>
            </div>
            <div>
              <div className="text-gray-500">No prazo</div>
              <div className="font-semibold text-green-600">
                {Math.round(agent.onTimePerformance)}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}