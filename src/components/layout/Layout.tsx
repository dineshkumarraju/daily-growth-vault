
import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/") return "today";
    if (location.pathname === "/analytics") return "analytics";
    return "today";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue={getActiveTab()} className="w-full" onValueChange={(value) => {
          if (value === "today") navigate("/");
          else navigate(`/${value}`);
        }}>
          <div className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>
          
          {children}
        </Tabs>
      </main>
      
      <footer className="border-t border-border py-4 text-center text-muted-foreground text-sm">
        <p>HabitVault &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
