import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AgentsList } from "@/components/monitoring/AgentsList";
import { AgentLocationMap } from "@/components/monitoring/AgentLocationMap";
import { MapControls } from "@/components/monitoring/MapControls";
import { useAgentsData } from "@/hooks/useAgentsData";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, isToday, isYesterday, startOfToday, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const RealTimeMonitoring = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const { data: agents, isLoading } = useAgentsData(selectedDate);
  
  const [showAgents, setShowAgents] = useState(true);
  const [showBases, setShowBases] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [showUnassignedServices, setShowUnassignedServices] = useState(false);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex h-[calc(100vh-4rem)] pt-4">
        {/* Coluna da esquerda - Lista de Agentes */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            {/* Header com título e filtros */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Agentes</h2>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {getDateLabel(selectedDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDate(startOfToday())}
                  className={cn(isToday(selectedDate) && "bg-primary text-primary-foreground hover:bg-primary/90")}
                >
                  Hoje
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDate(subDays(startOfToday(), 1))}
                  className={cn(isYesterday(selectedDate) && "bg-primary text-primary-foreground hover:bg-primary/90")}
                >
                  Ontem
                </Button>
              </div>
            </div>

            {/* Lista de Agentes */}
            {isLoading ? (
              <div>Carregando...</div>
            ) : (
              <AgentsList agents={agents || []} />
            )}
          </div>
        </div>

        {/* Coluna da direita - Mapa */}
        <div className="w-[40%] relative">
          <AgentLocationMap 
            agents={agents || []} 
            showAgents={showAgents}
            showBases={showBases}
            showServices={showServices}
            showUnassignedServices={showUnassignedServices}
          />
          <MapControls
            showAgents={showAgents}
            setShowAgents={setShowAgents}
            showBases={showBases}
            setShowBases={setShowBases}
            showServices={showServices}
            setShowServices={setShowServices}
            showUnassignedServices={showUnassignedServices}
            setShowUnassignedServices={setShowUnassignedServices}
          />
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;