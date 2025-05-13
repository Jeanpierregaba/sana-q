
import { useAuth } from "@/hooks/useAuth";
import DoctorDashboardPage from "./DoctorDashboardPage";
import FacilityDashboardPage from "./FacilityDashboardPage";
import PatientDashboardPage from "./PatientDashboardPage";
import { useEffect } from "react";

const DashboardPage = () => {
  const { profile, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("User profile in Dashboard:", profile);
  }, [profile]);

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
