
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_patient'
  | 'cancelled_by_practitioner'
  | 'no_show';

export interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  patient_id: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
  practitioner_id: string;
  practitioner_speciality: string | null;
  practitioner_first_name: string | null;
  practitioner_last_name: string | null;
  center_id: string;
  center_name: string | null;
  center_city: string | null;
}

export interface AppointmentFilters {
  status?: AppointmentStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  centerID?: string;
  practitionerID?: string;
  patientName?: string;
}

export const DEFAULT_FILTERS: AppointmentFilters = {
  status: 'all',
  dateFrom: undefined,
  dateTo: undefined,
  centerID: undefined,
  practitionerID: undefined,
  patientName: undefined
};

export function useAppointments(filters: AppointmentFilters = DEFAULT_FILTERS) {
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  
  const fetchAppointments = async () => {
    console.log("Fetching appointments with filters:", filters);
    
    try {
      let query = supabase
        .from('appointments_view')
        .select('*');
      
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.dateFrom) {
        query = query.gte('start_time', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('start_time', filters.dateTo);
      }
      
      if (filters.centerID) {
        query = query.eq('center_id', filters.centerID);
      }
      
      if (filters.practitionerID) {
        query = query.eq('practitioner_id', filters.practitionerID);
      }
      
      if (filters.patientName) {
        query = query.or(`patient_first_name.ilike.%${filters.patientName}%,patient_last_name.ilike.%${filters.patientName}%`);
      }
      
      // Get the count first
      const { count, error: countError } = await supabase
        .from('appointments_view')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error getting count:', countError);
        throw countError;
      }
      
      console.log("Total appointments count:", count);
      
      if (count !== null) {
        setTotalAppointments(count);
      }
      
      // Then get the data
      const { data, error } = await query
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching appointments data:', error);
        throw error;
      }
      
      console.log("Appointments data retrieved:", data?.length || 0);
      return data as Appointment[];
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      toast.error('Erreur lors de la récupération des rendez-vous');
      return [];
    }
  };
  
  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: fetchAppointments
  });
  
  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Statut du rendez-vous mis à jour');
      refetch();
      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      return false;
    }
  };
  
  const deleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Rendez-vous supprimé');
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Erreur lors de la suppression du rendez-vous');
      return false;
    }
  };

  return {
    appointments,
    isLoading,
    isError,
    refetch,
    totalAppointments,
    updateAppointmentStatus,
    deleteAppointment
  };
}

// Helper function to get status label in French
export function getStatusLabel(status: AppointmentStatus): string {
  const statusLabels: Record<AppointmentStatus, string> = {
    scheduled: 'Planifié',
    confirmed: 'Confirmé',
    arrived: 'Patient arrivé',
    in_progress: 'En consultation',
    completed: 'Terminé',
    cancelled_by_patient: 'Annulé par le patient',
    cancelled_by_practitioner: 'Annulé par le praticien',
    no_show: 'Absent'
  };
  
  return statusLabels[status] || status;
}

// Helper function to get status color
export function getStatusColor(status: AppointmentStatus): string {
  const statusColors: Record<AppointmentStatus, string> = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    arrived: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled_by_patient: 'bg-red-100 text-red-800',
    cancelled_by_practitioner: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}
