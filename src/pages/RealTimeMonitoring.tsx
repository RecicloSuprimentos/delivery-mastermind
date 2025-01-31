import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AgentsList } from "@/components/monitoring/AgentsList";
import { AgentLocationMap } from "@/components/monitoring/AgentLocationMap";
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

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium mb-4">Agentes</h2>
              {isLoading ? (
                <div>Carregando...</div>
              ) : (
                <AgentsList agents={agents || []} />
              )}
            </div>
          </div>
          <div className="lg:h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
            <AgentLocationMap agents={agents || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;