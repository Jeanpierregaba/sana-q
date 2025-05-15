
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Calendar, Clock, Users, Building } from "lucide-react";
import { AppointmentsTable } from "@/components/admin/appointments/AppointmentsTable";
import { AppointmentsFilters } from "@/components/admin/appointments/AppointmentsFilters";
import { useAppointments, AppointmentFilters, DEFAULT_FILTERS } from "@/hooks/useAppointments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AppointmentsPage() {
  const [filters, setFilters] = useState<AppointmentFilters>(DEFAULT_FILTERS);
  
  const { 
    appointments, 
    isLoading, 
    totalAppointments,
    updateAppointmentStatus,
    deleteAppointment
  } = useAppointments(filters);
  
  // Get appointment counts for dashboard
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['appointmentStats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayISOString = today.toISOString();
      
      // Get total appointments for today
      const { count: todayCount, error: todayError } = await supabase
        .from('appointments_view')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', todayISOString)
        .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
      
      if (todayError) throw todayError;
      
      // Get count of upcoming appointments
      const { count: upcomingCount, error: upcomingError } = await supabase
        .from('appointments_view')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', new Date().toISOString())
        .eq('status', 'scheduled');
      
      if (upcomingError) throw upcomingError;
      
      // Get count of cancelled appointments
      const { count: cancelledCount, error: cancelledError } = await supabase
        .from('appointments_view')
        .select('*', { count: 'exact', head: true })
        .or('status.eq.cancelled_by_patient,status.eq.cancelled_by_practitioner');
      
      if (cancelledError) throw cancelledError;
      
      return {
        today: todayCount || 0,
        upcoming: upcomingCount || 0,
        cancelled: cancelledCount || 0
      };
    }
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion des rendez-vous</h2>
        <p className="text-muted-foreground">
          Visualisez et gérez tous les rendez-vous pris sur la plateforme.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rendez-vous</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Rendez-vous enregistrés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? '...' : stats?.today}</div>
            <p className="text-xs text-muted-foreground">
              Rendez-vous programmés pour aujourd'hui
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À venir</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? '...' : stats?.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Rendez-vous confirmés à venir
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? '...' : stats?.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              Rendez-vous annulés
            </p>
          </CardContent>
        </Card>
      </div>
      
      <AppointmentsFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <AppointmentsTable
        appointments={appointments}
        isLoading={isLoading}
        onStatusChange={updateAppointmentStatus}
        onDeleteAppointment={deleteAppointment}
      />
    </div>
  );
}
