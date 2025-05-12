
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Users, Building, UserCog, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPractitioners: 0,
    totalCenters: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch total patients (profiles with user_type = 'patient')
        const { count: patientCount, error: patientError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'patient');
        
        if (patientError) throw patientError;

        // Fetch total practitioners
        const { count: practitionerCount, error: practitionerError } = await supabase
          .from('practitioners')
          .select('*', { count: 'exact', head: true });
        
        if (practitionerError) throw practitionerError;

        // Fetch total health centers
        const { count: centerCount, error: centerError } = await supabase
          .from('health_centers')
          .select('*', { count: 'exact', head: true });
        
        if (centerError) throw centerError;

        setStats({
          totalPatients: patientCount || 0,
          totalPractitioners: practitionerCount || 0,
          totalCenters: centerCount || 0
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  // Dummy data for activity chart
  const activityData = [
    { name: 'Lun', value: 12 },
    { name: 'Mar', value: 18 },
    { name: 'Mer', value: 29 },
    { name: 'Jeu', value: 22 },
    { name: 'Ven', value: 33 },
    { name: 'Sam', value: 15 },
    { name: 'Dim', value: 8 },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Administrateur</h2>
        <p className="text-muted-foreground">
          Gérez l'ensemble des données et paramètres de la plateforme MediSync.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/app/admin/patients">
          <Card className="hover:bg-secondary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total des Patients
              </CardTitle>
              <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                Cliquez pour gérer les patients
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/admin/practitioners">
          <Card className="hover:bg-secondary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total des Praticiens
              </CardTitle>
              <div className="rounded-full p-2 bg-purple-100 text-purple-700">
                <UserCog className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPractitioners}</div>
              <p className="text-xs text-muted-foreground">
                Cliquez pour gérer les praticiens
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/admin/centers">
          <Card className="hover:bg-secondary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Centres de santé
              </CardTitle>
              <div className="rounded-full p-2 bg-amber-100 text-amber-700">
                <Building className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCenters}</div>
              <p className="text-xs text-muted-foreground">
                Cliquez pour gérer les centres
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activité de la plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/app/admin/settings">
          <Card className="hover:bg-secondary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Paramètres de la plateforme
              </CardTitle>
              <div className="rounded-full p-2 bg-green-100 text-green-700">
                <Settings className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configurer les paramètres généraux de MediSync
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
