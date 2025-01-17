import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
}

export const DateTimePicker = ({ date, onDateChange }: DateTimePickerProps) => {
  const [time, setTime] = useState(date ? format(date, "HH:mm") : format(new Date(), "HH:mm"));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!date) {
      const now = new Date();
      onDateChange(now);
    }
  }, [date, onDateChange]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    if (date && e.target.value) {
      const [hours, minutes] = e.target.value.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onDateChange(newDate);
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && time) {
      const [hours, minutes] = time.split(":");
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onDateChange(newDate);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div>
      <Label>Data e Hora de Início</Label>
      <div className="flex gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-white",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-32 bg-white"
          />
        </div>
      </div>
    </div>
  );
};