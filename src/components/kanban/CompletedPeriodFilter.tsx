import React, { useState } from "react";
import { MoreHorizontal, Check } from "lucide-react";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

export type PeriodOption = "today" | "yesterday" | "week" | "month" | "custom";

export interface CustomDateRange {
  from: Date;
  to: Date;
}

interface CompletedPeriodFilterProps {
  currentPeriod: PeriodOption;
  onPeriodChange: (period: PeriodOption, range?: CustomDateRange) => void;
  customDateRange?: CustomDateRange;
}

export function CompletedPeriodFilter({
  currentPeriod,
  onPeriodChange,
  customDateRange,
}: CompletedPeriodFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(
    customDateRange
      ? { from: customDateRange.from, to: customDateRange.to }
      : undefined
  );

  const handleApplyCustomDate = () => {
    if (date?.from && date?.to) {
      onPeriodChange("custom", { from: date.from, to: date.to });
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex items-center ml-2" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-black/10 text-gray-500">
            <span className="sr-only">Abrir filtro</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white">
          <DropdownMenuItem onClick={() => onPeriodChange("today")}>
            Hoje
            {currentPeriod === "today" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("yesterday")}>
            Ontem
            {currentPeriod === "yesterday" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("week")}>
            Esta semana
            {currentPeriod === "week" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("month")}>
            Este mês
            {currentPeriod === "month" && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <div 
                className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${currentPeriod === "custom" ? "bg-slate-100" : ""}`}
                role="menuitem"
              >
                Período Específico
                {currentPeriod === "custom" && <Check className="ml-auto h-4 w-4" />}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="end" side="bottom">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                locale={ptBR}
              />
              <div className="p-3 border-t flex justify-end">
                <Button 
                  size="sm" 
                  onClick={handleApplyCustomDate}
                  disabled={!date?.from || !date?.to}
                >
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
