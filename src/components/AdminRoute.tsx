
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  // Render children if admin
  return <>{children}</>;
};

export default AdminRoute;
