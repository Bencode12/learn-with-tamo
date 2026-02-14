import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  className,
  minDate,
  maxDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => 
    value ? parseISO(value) : new Date()
  );
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? parseISO(value) : null;
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateSelect = (date: Date) => {
    if (minDate && date < parseISO(minDate)) return;
    if (maxDate && date > parseISO(maxDate)) return;
    
    onChange?.(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < parseISO(minDate)) return true;
    if (maxDate && date > parseISO(maxDate)) return true;
    return false;
  };

  return (
    <div ref={datePickerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={value ? format(parseISO(value), "PPP") : ""}
          placeholder={placeholder}
          readOnly
          className="pr-10 cursor-pointer bg-background"
          onClick={() => setIsOpen(!isOpen)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 rounded-lg border bg-popover p-3 shadow-lg">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDisabled = !isCurrentMonth || isDateDisabled(day);
              
              return (
                <Button
                  key={day.toString()}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`
                    h-8 w-8 p-0 text-sm
                    ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}
                    ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                    ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-accent hover:text-accent-foreground'}
                  `}
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                >
                  {format(day, "d")}
                </Button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const today = new Date();
                if (!isDateDisabled(today)) {
                  handleDateSelect(today);
                }
              }}
              disabled={isDateDisabled(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}