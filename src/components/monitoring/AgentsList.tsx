import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, MapPin, Navigation } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status?: string;
  email?: string;
}

interface AgentsListProps {
  agents: Agent[];
}

export function AgentsList({ agents }: AgentsListProps) {
  const getStatusBadge = (status: string = "offline") => {
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

  const getTimelineStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
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
              <div className="text-lg font-semibold">14/27</div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={52} className="mb-4" />

          {/* Timeline */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-[40px]"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index < 5
                      ? "bg-green-100 text-green-800"
                      : index === 5
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {index < 5 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    (index + 15).toString()
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {index < 5 ? "✓" : `${14 + index}:00`}
                </div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <div className="text-gray-500">Coletas</div>
              <div className="font-semibold">6</div>
            </div>
            <div>
              <div className="text-gray-500">Entregas</div>
              <div className="font-semibold">8</div>
            </div>
            <div>
              <div className="text-gray-500">Pendentes</div>
              <div className="font-semibold">13</div>
            </div>
            <div>
              <div className="text-gray-500">No prazo</div>
              <div className="font-semibold text-green-600">92%</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}