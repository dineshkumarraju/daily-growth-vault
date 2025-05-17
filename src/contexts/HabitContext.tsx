
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export type DaySelection = "everyday" | "weekdays" | "custom";

export type Habit = {
  id: string;
  name: string;
  targetDays: DaySelection;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  startDate: string;
  createdAt: string;
};

export type HabitLog = {
  [habitId: string]: {
    [date: string]: "completed" | "missed";
  };
};

export type HabitStreak = {
  current: number;
  longest: number;
};

export type HabitStreaks = {
  [habitId: string]: HabitStreak;
};

type HabitContextType = {
  habits: Habit[];
  habitLog: HabitLog;
  streaks: HabitStreaks;
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitStatus: (habitId: string, date: string, status: "completed" | "missed") => void;
  calculateStreaks: () => void;
};

const HabitContext = createContext<HabitContextType | null>(null);

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabit must be used within a HabitProvider");
  }
  return context;
};

export const HabitProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLog, setHabitLog] = useState<HabitLog>({});
  const [streaks, setStreaks] = useState<HabitStreaks>({});

  // Load habits from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storedHabits = localStorage.getItem(`habitVault-habits-${user.id}`);
      const storedLog = localStorage.getItem(`habitVault-log-${user.id}`);
      
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
      
      if (storedLog) {
        setHabitLog(JSON.parse(storedLog));
      }
    } else {
      setHabits([]);
      setHabitLog({});
    }
  }, [user]);

  // Calculate streaks whenever habits or logs change
  useEffect(() => {
    if (user && (habits.length > 0 || Object.keys(habitLog).length > 0)) {
      calculateStreaks();
    }
  }, [habits, habitLog, user]);

  // Save to localStorage when habits change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`habitVault-habits-${user.id}`, JSON.stringify(habits));
    }
  }, [habits, user]);

  // Save to localStorage when logs change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`habitVault-log-${user.id}`, JSON.stringify(habitLog));
    }
  }, [habitLog, user]);

  const addHabit = (habitData: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setHabits((prevHabits) => [...prevHabits, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
    
    // Clean up habit log
    setHabitLog((prev) => {
      const newLog = { ...prev };
      delete newLog[id];
      return newLog;
    });
  };

  const toggleHabitStatus = (habitId: string, date: string, status: "completed" | "missed") => {
    setHabitLog((prevLog) => {
      const habitData = prevLog[habitId] || {};
      const newStatus = habitData[date] === status ? undefined : status;
      
      return {
        ...prevLog,
        [habitId]: {
          ...habitData,
          ...(newStatus ? { [date]: newStatus } : {}),
        },
      };
    });
  };

  // Helper to check if a habit is scheduled for a given day
  const isHabitScheduledForDay = (habit: Habit, date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (habit.targetDays === "everyday") return true;
    if (habit.targetDays === "weekdays") return dayOfWeek >= 1 && dayOfWeek <= 5;
    if (habit.targetDays === "custom" && habit.customDays) {
      return habit.customDays.includes(dayOfWeek);
    }
    return false;
  };

  // Helper to format date string to YYYY-MM-DD
  const formatDateToString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const calculateStreaks = () => {
    const newStreaks: HabitStreaks = {};
    
    habits.forEach((habit) => {
      const habitId = habit.id;
      const habitEntries = habitLog[habitId] || {};
      
      let currentStreak = 0;
      let longestStreak = 0;
      
      // Start checking from the current date backwards
      const today = new Date();
      let currentDate = new Date(today);
      let checkDate = formatDateToString(currentDate);
      
      // Check each previous day until the streak breaks
      while (true) {
        // Skip days when the habit is not scheduled
        if (isHabitScheduledForDay(habit, currentDate)) {
          const status = habitEntries[checkDate];
          
          if (status === "completed") {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            // Streak is broken if the habit was missed or not logged
            break;
          }
        }
        
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
        checkDate = formatDateToString(currentDate);
        
        // Stop if we reach the habit start date
        if (new Date(checkDate) < new Date(habit.startDate)) {
          break;
        }
      }
      
      // Now check for the longest streak in historical data
      const startDate = new Date(habit.startDate);
      const allDates = Object.keys(habitEntries).sort();
      let tempStreak = 0;
      
      for (let i = 0; i < allDates.length; i++) {
        const checkDate = allDates[i];
        const dateObj = new Date(checkDate);
        
        // Skip if before start date
        if (dateObj < startDate) continue;
        
        if (isHabitScheduledForDay(habit, dateObj) && habitEntries[checkDate] === "completed") {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      
      newStreaks[habitId] = {
        current: currentStreak,
        longest: longestStreak,
      };
    });
    
    setStreaks(newStreaks);
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        habitLog,
        streaks,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitStatus,
        calculateStreaks,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};
