
import { useMemo, useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useHabit } from "@/contexts/HabitContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import HeatmapCalendar from "./HeatmapCalendar";

const Analytics = () => {
  const { habits, habitLog, streaks } = useHabit();
  const { analyticsTimeRange, setAnalyticsTimeRange } = usePreferences();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  
  const selectedHabitData = useMemo(() => {
    if (!selectedHabit) return null;
    return habits.find((h) => h.id === selectedHabit) || null;
  }, [selectedHabit, habits]);

  // Completion statistics
  const completionStats = useMemo(() => {
    const totalHabits = habits.length;
    let totalCompletions = 0;
    let totalMissed = 0;
    
    // Count completions and misses
    Object.values(habitLog).forEach((logEntries) => {
      Object.values(logEntries).forEach((status) => {
        if (status === "completed") {
          totalCompletions++;
        } else if (status === "missed") {
          totalMissed++;
        }
      });
    });
    
    const completionRate = totalCompletions + totalMissed > 0
      ? Math.round((totalCompletions / (totalCompletions + totalMissed)) * 100)
      : 0;
    
    return {
      totalHabits,
      totalCompletions,
      totalMissed,
      completionRate,
    };
  }, [habits.length, habitLog]);

  // Find best performing habit
  const bestPerformingHabit = useMemo(() => {
    if (habits.length === 0) return null;
    
    let bestHabit = habits[0];
    let bestStreak = 0;
    
    Object.entries(streaks).forEach(([habitId, streak]) => {
      if (streak.longest > bestStreak) {
        bestStreak = streak.longest;
        bestHabit = habits.find((h) => h.id === habitId) || bestHabit;
      }
    });
    
    return {
      habit: bestHabit,
      longestStreak: bestStreak,
    };
  }, [habits, streaks]);

  // Prepare data for charts based on time range
  const chartData = useMemo(() => {
    const today = new Date();
    let startDate, endDate;
    
    if (analyticsTimeRange === "week") {
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
    } else if (analyticsTimeRange === "month") {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    } else {
      // Default to all-time or a reasonable time span
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
      endDate = today;
    }
    
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Prepare daily completion data
    const dailyData = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      let completions = 0;
      let missed = 0;
      
      Object.values(habitLog).forEach((logEntries) => {
        const status = logEntries[dateStr];
        if (status === "completed") {
          completions++;
        } else if (status === "missed") {
          missed++;
        }
      });
      
      return {
        date: format(date, "MMM dd"),
        completions,
        missed,
      };
    });
    
    // Prepare habit performance data
    const habitPerformance = habits.map((habit) => {
      let completions = 0;
      let missed = 0;
      
      const habitEntries = habitLog[habit.id] || {};
      Object.entries(habitEntries).forEach(([dateStr, status]) => {
        const date = new Date(dateStr);
        if (date >= startDate && date <= endDate) {
          if (status === "completed") {
            completions++;
          } else if (status === "missed") {
            missed++;
          }
        }
      });
      
      return {
        id: habit.id,
        name: habit.name,
        completions,
        missed,
        total: completions + missed,
        completionRate: completions + missed > 0 
          ? Math.round((completions / (completions + missed)) * 100) 
          : 0,
      };
    });
    
    return {
      dailyData,
      habitPerformance,
    };
  }, [habits, habitLog, analyticsTimeRange]);

  // Prepare data for pie chart
  const pieData = useMemo(() => {
    return [
      { name: "Completed", value: completionStats.totalCompletions },
      { name: "Missed", value: completionStats.totalMissed },
    ];
  }, [completionStats]);
  
  const COLORS = ["#4ade80", "#f87171"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="flex space-x-2">
          <Button 
            variant={analyticsTimeRange === "week" ? "default" : "outline"} 
            size="sm"
            onClick={() => setAnalyticsTimeRange("week")}
          >
            Week
          </Button>
          <Button 
            variant={analyticsTimeRange === "month" ? "default" : "outline"} 
            size="sm"
            onClick={() => setAnalyticsTimeRange("month")}
          >
            Month
          </Button>
          <Button 
            variant={analyticsTimeRange === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setAnalyticsTimeRange("all")}
          >
            All Time
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionStats.totalHabits}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionStats.completionRate}%</p>
            <p className="text-sm text-muted-foreground">
              {completionStats.totalCompletions} completions of {completionStats.totalCompletions + completionStats.totalMissed} check-ins
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Best Performing Habit</CardTitle>
          </CardHeader>
          <CardContent>
            {bestPerformingHabit ? (
              <>
                <p className="text-xl font-bold truncate">{bestPerformingHabit.habit.name}</p>
                <p className="text-sm text-muted-foreground">
                  Longest streak: {bestPerformingHabit.longestStreak} days
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No habits yet</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80">
          <CardHeader>
            <CardTitle className="text-lg">Daily Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.dailyData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={analyticsTimeRange === "week" ? 0 : "preserveStartEnd"}
                />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="completions" name="Completed" fill="#4ade80" />
                <Bar dataKey="missed" name="Missed" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="h-80">
          <CardHeader>
            <CardTitle className="text-lg">Completion Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Habit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Select a habit to view its history:</div>
              <div className="flex flex-wrap gap-2">
                {habits.map((habit) => (
                  <Button
                    key={habit.id}
                    variant={selectedHabit === habit.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedHabit(habit.id)}
                  >
                    {habit.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {selectedHabitData && (
              <HeatmapCalendar habit={selectedHabitData} className="mt-4" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
