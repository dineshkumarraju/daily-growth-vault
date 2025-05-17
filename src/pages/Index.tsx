
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Already logged in, navigate to dashboard
        navigate("/");
      } else {
        // Not logged in, navigate to auth
        navigate("/auth");
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );
};

export default Index;
