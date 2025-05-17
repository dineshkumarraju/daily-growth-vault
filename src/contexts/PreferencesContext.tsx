
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type PreferencesContextType = {
  darkMode: boolean;
  showQuotes: boolean;
  analyticsTimeRange: "week" | "month" | "all";
  toggleDarkMode: () => void;
  toggleShowQuotes: () => void;
  setAnalyticsTimeRange: (range: "week" | "month" | "all") => void;
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showQuotes, setShowQuotes] = useState(true);
  const [analyticsTimeRange, setAnalyticsTimeRangeState] = useState<"week" | "month" | "all">("week");

  // Load preferences from localStorage
  useEffect(() => {
    if (user) {
      const storedPreferences = localStorage.getItem(`habitVault-prefs-${user.id}`);
      if (storedPreferences) {
        const prefs = JSON.parse(storedPreferences);
        setDarkMode(prefs.darkMode ?? false);
        setShowQuotes(prefs.showQuotes ?? true);
        setAnalyticsTimeRangeState(prefs.analyticsTimeRange ?? "week");
      }
    }
  }, [user]);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Save preferences to localStorage
  const savePreferences = () => {
    if (user) {
      localStorage.setItem(
        `habitVault-prefs-${user.id}`,
        JSON.stringify({
          darkMode,
          showQuotes,
          analyticsTimeRange,
        })
      );
    }
  };

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [darkMode, showQuotes, analyticsTimeRange, user]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleShowQuotes = () => {
    setShowQuotes((prev) => !prev);
  };

  const setAnalyticsTimeRange = (range: "week" | "month" | "all") => {
    setAnalyticsTimeRangeState(range);
  };

  return (
    <PreferencesContext.Provider
      value={{
        darkMode,
        showQuotes,
        analyticsTimeRange,
        toggleDarkMode,
        toggleShowQuotes,
        setAnalyticsTimeRange,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};
