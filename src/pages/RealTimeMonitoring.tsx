
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AgentsList } from "@/components/monitoring/AgentsList";
import { AgentLocationMap } from "@/components/monitoring/AgentLocationMap";
import { MapControls } from "@/components/monitoring/MapControls";
import { useAgentsData } from "@/hooks/useAgentsData";
import { useRealtimeServices } from "@/hooks/useRealtimeServices";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, isToday, isYesterday, startOfToday, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const RealTimeMonitoring = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  
  // Inicializar sistema realtime centralizado
  useRealtimeServices();
  
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
      <main className="pt-[73px]">
        <div className="flex h-[calc(100vh-[73px])]">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4 bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-medium">Agentes</h2>
                <div className="flex items-center gap-2">
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                          (!isToday(selectedDate) && !isYesterday(selectedDate)) && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {(!isToday(selectedDate) && !isYesterday(selectedDate)) ? getDateLabel(selectedDate) : "Data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="bg-white rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {isLoading ? (
                <div>Carregando...</div>
              ) : (
                <AgentsList agents={agents || []} />
              )}
            </div>
          </div>

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
      </main>
    </div>
  );
};

export default RealTimeMonitoring;
