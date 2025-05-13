
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { session, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  console.log('AdminRoute - isAdmin:', isAdmin, 'isLoading:', isLoading);

  // Afficher l'état de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion admin si pas authentifié
  if (!session) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // Rediriger vers la page principale si l'utilisateur n'est pas admin
  if (!isAdmin) {
    console.log('User is not admin, redirecting to /app');
    return <Navigate to="/app" replace />;
  }

  // Afficher le contenu si l'utilisateur est admin
  console.log('User is admin, showing admin content');
  return <>{children}</>;
};

export default AdminRoute;
