"use client";
import { formatDate } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { forwardRef } from "react";

export const DatePicker = forwardRef<
  HTMLDivElement,
  {
    date?: Date;
    setDate: (date?: Date) => void;
  }
>(function DatePickerCmp({ date, setDate }, ref) {
  return (
    <Popover>
      <PopoverTrigger asChild className="h-14">
        <Button
          variant={"outline"}
          className={cn(
            "w-full pl-3 text-left font-normal",
            date && "text-muted-foreground",
          )}
        >
          {date ? (
            formatDate(date, "PPP", { locale: ptBR })
          ) : (
            <span>Escolha um data</span>
          )}
          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center" ref={ref}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => date < new Date()}
          defaultMonth={date}
          className="w-full"
        />
      </PopoverContent>
    </Popover>
  );
});
