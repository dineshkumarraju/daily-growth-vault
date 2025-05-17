
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHabit, Habit, DaySelection } from "@/contexts/HabitContext";
import { useToast } from "@/hooks/use-toast";

type HabitFormProps = {
  isOpen: boolean;
  onClose: () => void;
  editingHabit?: Habit;
};

const HabitForm = ({ isOpen, onClose, editingHabit }: HabitFormProps) => {
  const { addHabit, updateHabit } = useHabit();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [targetDays, setTargetDays] = useState<DaySelection>("everyday");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setTargetDays(editingHabit.targetDays);
      setCustomDays(editingHabit.customDays || []);
      setStartDate(editingHabit.startDate);
    } else {
      resetForm();
    }
  }, [editingHabit, isOpen]);

  const resetForm = () => {
    setName("");
    setTargetDays("everyday");
    setCustomDays([]);
    setStartDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a habit name",
        variant: "destructive",
      });
      return;
    }
    
    if (targetDays === "custom" && customDays.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one day for your custom schedule",
        variant: "destructive",
      });
      return;
    }
    
    const habitData = {
      name: name.trim(),
      targetDays,
      customDays: targetDays === "custom" ? customDays : undefined,
      startDate,
    };
    
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
      toast({
        title: "Habit updated",
        description: `"${name}" has been updated successfully`,
      });
    } else {
      addHabit(habitData);
      toast({
        title: "Habit created",
        description: `"${name}" has been added to your habits`,
      });
    }
    
    onClose();
    resetForm();
  };
  
  const handleCustomDayToggle = (day: number) => {
    setCustomDays((current) => {
      if (current.includes(day)) {
        return current.filter((d) => d !== day);
      } else {
        return [...current, day].sort();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingHabit ? "Edit Habit" : "Create New Habit"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="E.g., Drink water, Read for 20 mins, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Target Days</Label>
            <RadioGroup 
              value={targetDays} 
              onValueChange={(value) => setTargetDays(value as DaySelection)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="everyday" id="everyday" />
                <Label htmlFor="everyday" className="cursor-pointer">Every day</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekdays" id="weekdays" />
                <Label htmlFor="weekdays" className="cursor-pointer">Weekdays (Mon-Fri)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">Custom Days</Label>
              </div>
            </RadioGroup>
          </div>
          
          {targetDays === "custom" && (
            <div className="space-y-2 pl-6">
              <Label>Choose Days</Label>
              <div className="flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div 
                    key={day} 
                    className="flex items-center space-x-2 bg-secondary rounded-md p-1.5"
                  >
                    <Checkbox 
                      id={`day-${index}`}
                      checked={customDays.includes(index)}
                      onCheckedChange={() => handleCustomDayToggle(index)}
                    />
                    <Label 
                      htmlFor={`day-${index}`}
                      className="cursor-pointer text-sm"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <DialogFooter className="flex justify-end space-x-2 sm:space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingHabit ? "Save Changes" : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitForm;
