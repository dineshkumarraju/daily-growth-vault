
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useHabit, Habit } from "@/contexts/HabitContext";

type HeatmapCalendarProps = {
  habit: Habit;
  className?: string;
};

const HeatmapCalendar = ({ habit, className = "" }: HeatmapCalendarProps) => {
  const { habitLog } = useHabit();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const habitData = habitLog[habit.id] || {};
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  
  // Generate the days array with the correct spacing for the start of the month
  const calendarDays = useMemo(() => {
    const placeholders = Array(startDay).fill(null);
    return [...placeholders, ...days];
  }, [startDay, days]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const getCellColor = (date: Date | null) => {
    if (!date) return "bg-transparent";
    
    const dateStr = format(date, "yyyy-MM-dd");
    const status = habitData[dateStr];
    
    if (status === "completed") {
      return "bg-habit-completed hover:bg-habit-completed/90";
    } else if (status === "missed") {
      return "bg-habit-missed hover:bg-habit-missed/90";
    } else {
      return "bg-habit-neutral/20 hover:bg-habit-neutral/30";
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <TooltipProvider key={`day-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`aspect-square rounded-md ${getCellColor(day)} flex items-center justify-center cursor-pointer transition-colors`}
                >
                  {day && <span className="text-xs">{format(day, "d")}</span>}
                </div>
              </TooltipTrigger>
              {day && (
                <TooltipContent>
                  <p className="text-sm font-medium">{format(day, "PPPP")}</p>
                  {habitData[format(day, "yyyy-MM-dd")] === "completed" ? (
                    <p className="text-xs text-habit-completed">Completed</p>
                  ) : habitData[format(day, "yyyy-MM-dd")] === "missed" ? (
                    <p className="text-xs text-habit-missed">Missed</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No record</p>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default HeatmapCalendar;
