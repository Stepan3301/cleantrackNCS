import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoursRecord, HourEntry } from "@/types/hours";

interface HoursCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDay: number | null;
  onDaySelect: (day: number | null) => void;
  hoursData: HoursRecord | { [day: string]: HourEntry };
  isStaff: boolean;
  isSupervisor: boolean;
  supervisedStaff?: Array<{ id: string }>;
}

export const HoursCalendar = ({
  currentMonth,
  onMonthChange,
  selectedDay,
  onDaySelect,
  hoursData,
  isStaff,
  isSupervisor,
  supervisedStaff
}: HoursCalendarProps) => {
  // Get days in current month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc)
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  
  // Create array of day numbers
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Create array for empty cells before first day
  const emptyCells = Array.from({ length: firstDay }, (_, i) => i);
  
  // Format month and year
  const monthYearFormat = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Helper functions
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return checkDate < new Date(today.setHours(0, 0, 0, 0));
  };

  const isFutureDate = (day: number) => {
    const today = new Date();
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return checkDate > new Date(today.setHours(23, 59, 59, 999));
  };

  const getHoursForDay = (day: number): string | undefined => {
    const dayStr = day.toString();
    const entry = hoursData[dayStr];
    if (!entry) return undefined;
    if (typeof entry === 'object' && 'hours' in entry) {
      return `${entry.hours}h`;
    }
    return undefined;
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
        >
          <ChevronLeft size={20} />
        </Button>
        
        <div className="flex items-center">
          <CalendarIcon size={18} className="mr-2 text-primary" />
          <h2 className="font-medium">{monthYearFormat}</h2>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
        >
          <ChevronRight size={20} />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="h-24 rounded-md"></div>
          ))}
          
          {days.map((day) => {
            const hasHours = isStaff
              ? getHoursForDay(day) !== undefined
              : (isSupervisor && supervisedStaff?.some(staff =>
                  hoursData[staff.id]?.[day.toString()] !== undefined
                ));
                
            const dayIsToday = isToday(day);
            const dayIsDisabled = !dayIsToday; // Disable all days except today
            
            return (
              <div 
                key={`day-${day}`} 
                className={`h-24 rounded-md border border-border p-2 ${
                  dayIsDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                } transition-colors ${
                  day === selectedDay ? "ring-2 ring-primary" : ""
                } ${dayIsToday ? "bg-primary/5" : ""} ${
                  isPastDate(day) && !dayIsToday ? "bg-muted/20" : ""
                } ${isFutureDate(day) ? "bg-muted/10" : ""}`}
                onClick={() => dayIsDisabled ? null : onDaySelect(day)}
                title={dayIsDisabled ? "You can only submit hours for the current day" : ""}
              >
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${dayIsToday ? "text-primary" : ""}`}>
                    {day}
                  </span>
                  {hasHours && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                      {isStaff ? getHoursForDay(day) : '●'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
