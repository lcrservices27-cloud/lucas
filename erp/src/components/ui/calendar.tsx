"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
  hasEvent?: (date: Date) => boolean;
}

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function Calendar({
  selected,
  onSelect,
  month,
  onMonthChange,
  className,
  hasEvent,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    month ?? selected ?? new Date()
  );

  const currentMonth = month ?? internalMonth;

  const setMonth = React.useCallback(
    (next: Date) => {
      if (onMonthChange) {
        onMonthChange(next);
      } else {
        setInternalMonth(next);
      }
    },
    [onMonthChange]
  );

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div
      data-slot="calendar"
      className={cn("w-fit p-3", className)}
    >
      <div className="flex items-center justify-between pb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 bg-transparent p-0"
          onClick={() => setMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="text-sm font-medium capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 bg-transparent p-0"
          onClick={() => setMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-muted-foreground flex h-8 w-8 items-center justify-center text-xs font-normal capitalize"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const outside = !isSameMonth(day, currentMonth);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const today = isToday(day);

          const showDot = hasEvent?.(day) && !isSelected;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect?.(day)}
              data-selected={isSelected}
              data-today={today}
              data-outside={outside}
              className={cn(
                "text-foreground relative inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-normal transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
                outside && "text-muted-foreground opacity-50",
                today && !isSelected && "ring-ring/50 ring-1",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {format(day, "d")}
              {showDot && (
                <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
