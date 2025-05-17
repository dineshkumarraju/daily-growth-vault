
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHabit, Habit } from "@/contexts/HabitContext";
import HabitCard from "../habits/HabitCard";
import HabitForm from "../habits/HabitForm";

const HabitList = () => {
  const { habits, streaks } = useHabit();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  
  const handleOpenForm = () => {
    setEditingHabit(undefined);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(undefined);
  };
  
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Habits</h2>
        <Button onClick={handleOpenForm} className="flex items-center space-x-1">
          <Plus className="h-4 w-4 mr-1" />
          <span>New Habit</span>
        </Button>
      </div>
      
      {habits.length === 0 ? (
        <div className="bg-secondary/30 rounded-lg border border-border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No habits yet</h3>
          <p className="text-muted-foreground mb-4">Create your first habit to start building consistency!</p>
          <Button onClick={handleOpenForm}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={streaks[habit.id] || { current: 0, longest: 0 }}
              onEditHabit={handleEditHabit}
            />
          ))}
        </div>
      )}
      
      {/* Habit Form Modal */}
      <HabitForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingHabit={editingHabit}
      />
    </div>
  );
};

export default HabitList;
