
import { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  return <ProtectedRoute requireAdmin={true}>{children}</ProtectedRoute>;
};

export default AdminRoute;
