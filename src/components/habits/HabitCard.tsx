
import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Trash2, Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useHabit, Habit, HabitStreak } from "@/contexts/HabitContext";

type HabitCardProps = {
  habit: Habit;
  streak: HabitStreak;
  onEditHabit: (habit: Habit) => void;
};

const HabitCard = ({ habit, streak, onEditHabit }: HabitCardProps) => {
  const { deleteHabit, toggleHabitStatus, habitLog } = useHabit();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const today = format(new Date(), "yyyy-MM-dd");
  const habitStatus = habitLog[habit.id]?.[today];
  
  const targetDaysDisplay = () => {
    switch (habit.targetDays) {
      case "everyday":
        return "Every day";
      case "weekdays":
        return "Weekdays";
      case "custom":
        if (!habit.customDays) return "Custom days";
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return habit.customDays.map(day => dayNames[day]).join(", ");
      default:
        return "Unknown";
    }
  };
  
  const handleStatusToggle = () => {
    // Toggle between completed and not completed
    const newStatus = habitStatus === "completed" ? "missed" : "completed";
    toggleHabitStatus(habit.id, today, newStatus);
  };
  
  const handleDeleteClick = () => {
    if (isDeleting) {
      deleteHabit(habit.id);
    } else {
      setIsDeleting(true);
      
      // Reset after 3 seconds if not confirmed
      const timer = setTimeout(() => {
        setIsDeleting(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  };

  return (
    <Card className="habit-card hover:border-primary/30 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => onEditHabit(habit)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit habit</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isDeleting ? "destructive" : "outline"} 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isDeleting ? "Confirm delete" : "Delete habit"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{targetDaysDisplay()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <span className="text-xs">Current streak:</span>
                <span className="font-bold">{streak.current}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <span className="text-xs">Best:</span>
                <span className="font-bold">{streak.longest}</span>
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={handleStatusToggle}
          variant={habitStatus === "completed" ? "default" : "outline"}
          className={`w-full ${habitStatus === "completed" ? "bg-primary text-primary-foreground" : ""}`}
        >
          <CheckCircle className={`mr-2 h-4 w-4 ${habitStatus === "completed" ? "animate-check" : ""}`} />
          {habitStatus === "completed" ? "Completed Today" : "Mark as Completed"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HabitCard;
