
import { createContext, useContext, useEffect, useState } from "react";
import { usePreferences } from "./PreferencesContext";

type Quote = {
  text: string;
  author: string;
};

type QuoteContextType = {
  dailyQuote: Quote;
  isLoading: boolean;
  error: string | null;
};

const QuoteContext = createContext<QuoteContextType | null>(null);

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
};

// Static list of quotes as fallback
const staticQuotes: Quote[] = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Habits are first cobwebs, then cables.", author: "Spanish Proverb" },
  { text: "A habit cannot be tossed out the window; it must be coaxed down the stairs a step at a time.", author: "Mark Twain" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "You'll never change your life until you change something you do daily. The secret of your success is found in your daily routine.", author: "John C. Maxwell" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "Your net worth to the world is usually determined by what remains after your bad habits are subtracted from your good ones.", author: "Benjamin Franklin" },
  { text: "First we make our habits, then our habits make us.", author: "Charles C. Noble" },
  { text: "Successful people are simply those with successful habits.", author: "Brian Tracy" },
  { text: "Excellence is not a singular act, but a habit. You are what you repeatedly do.", author: "Shaquille O'Neal" },
  { text: "Habits change into character.", author: "Ovid" },
  { text: "The only way to make a new habit stick is to make it part of your identity.", author: "Naval Ravikant" },
  { text: "Your life today is essentially the sum of your habits.", author: "James Clear" },
  { text: "Small habits make a big difference.", author: "Anonymous" }
];

export const QuoteProvider = ({ children }: { children: React.ReactNode }) => {
  const { showQuotes } = usePreferences();
  const [dailyQuote, setDailyQuote] = useState<Quote>(staticQuotes[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showQuotes) {
      setIsLoading(false);
      return;
    }

    const fetchQuote = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Check cache
        const cachedQuote = localStorage.getItem(`habitVault-quote-${today}`);
        
        if (cachedQuote) {
          setDailyQuote(JSON.parse(cachedQuote));
          setIsLoading(false);
          return;
        }
        
        // If no cached quote, use the static list with a deterministic selection based on the date
        const dateObj = new Date();
        const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const quoteIndex = dayOfYear % staticQuotes.length;
        
        const todayQuote = staticQuotes[quoteIndex];
        setDailyQuote(todayQuote);
        
        // Cache the quote
        localStorage.setItem(`habitVault-quote-${today}`, JSON.stringify(todayQuote));
      } catch (err) {
        console.error("Failed to get quote:", err);
        setError("Failed to load today's quote");
        
        // Use a random fallback quote
        const fallbackIndex = Math.floor(Math.random() * staticQuotes.length);
        setDailyQuote(staticQuotes[fallbackIndex]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [showQuotes]);

  return (
    <QuoteContext.Provider value={{ dailyQuote, isLoading, error }}>
      {children}
    </QuoteContext.Provider>
  );
};
