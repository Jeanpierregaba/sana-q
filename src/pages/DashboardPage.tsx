
import { useAuth } from "@/hooks/useAuth";
import DoctorDashboardPage from "./DoctorDashboardPage";
import FacilityDashboardPage from "./FacilityDashboardPage";
import PatientDashboardPage from "./PatientDashboardPage";
import AdminDashboardPage from "./admin/AdminDashboardPage";
import { useEffect } from "react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const DashboardPage = () => {
  const { profile, isLoading, isAdmin } = useAuth();
  
  useEffect(() => {
    console.log("User profile in Dashboard:", profile);
  }, [profile]);

  useEffect(() => {
    // Notify the user about which dashboard is being displayed
    if (profile?.user_type) {
      const dashboardTypes = {
        doctor: "Praticien",
        facility: "Centre de Santé",
        patient: "Patient",
        admin: "Administrateur"
      };
      
      toast.info(`Tableau de bord ${dashboardTypes[profile.user_type] || "Utilisateur"} chargé`);
    }
  }, [profile?.user_type]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Si c'est un admin, rediriger directement vers le dashboard admin
  if (isAdmin) {
    console.log("Redirecting admin to admin dashboard");
    return <Navigate to="/app/admin/dashboard" replace />;
  }

  // Afficher le dashboard correspondant au type d'utilisateur
  switch (profile?.user_type) {
    case "doctor":
      console.log("Loading doctor dashboard");
      return <DoctorDashboardPage />;
    case "facility":
      console.log("Loading facility dashboard");
      return <FacilityDashboardPage />;
    default:
      console.log("Loading default (patient) dashboard");
      return <PatientDashboardPage />;
  }
};

export default DashboardPage;
