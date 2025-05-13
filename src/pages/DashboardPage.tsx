
import { useAuth } from "@/hooks/useAuth";
import DoctorDashboardPage from "./DoctorDashboardPage";
import FacilityDashboardPage from "./FacilityDashboardPage";
import PatientDashboardPage from "./PatientDashboardPage";
import { useEffect } from "react";
import { toast } from "sonner";

const DashboardPage = () => {
  const { profile, isLoading } = useAuth();
  
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
        admin: "Patient (Administrateur)"
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

  // Rediriger vers le tableau de bord approprié en fonction du type d'utilisateur
  switch (profile?.user_type) {
    case "doctor":
      return <DoctorDashboardPage />;
    case "facility":
      return <FacilityDashboardPage />;
    case "admin":
      // Les administrateurs verront le tableau de bord patient par défaut
      // Note: ils ont accès au tableau de bord admin via le menu
      return <PatientDashboardPage />;
    default:
      // Par défaut, afficher le tableau de bord patient
      return <PatientDashboardPage />;
  }
};

export default DashboardPage;
