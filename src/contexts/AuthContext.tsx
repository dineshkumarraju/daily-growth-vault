
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock authentication functions
const mockUsers: Record<string, { id: string; email: string; password: string }> = {};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("habitVaultUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would make an API request
    return new Promise<void>((resolve, reject) => {
      const foundUser = Object.values(mockUsers).find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const { password, ...userData } = foundUser;
        setUser(userData);
        localStorage.setItem("habitVaultUser", JSON.stringify(userData));
        resolve();
      } else {
        reject(new Error("Invalid email or password"));
      }
    });
  };

  const register = async (email: string, password: string) => {
    // In a real app, this would make an API request
    return new Promise<void>((resolve, reject) => {
      if (Object.values(mockUsers).some((u) => u.email === email)) {
        reject(new Error("Email already in use"));
        return;
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
      };

      mockUsers[newUser.id] = newUser;
      
      const { password: _, ...userData } = newUser;
      setUser(userData);
      localStorage.setItem("habitVaultUser", JSON.stringify(userData));
      resolve();
    });
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("habitVaultUser");
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
