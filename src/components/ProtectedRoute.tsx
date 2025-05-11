
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
