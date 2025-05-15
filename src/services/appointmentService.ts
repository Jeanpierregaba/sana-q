
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFilters, AppointmentStatus } from "@/types/appointments";
import { toast } from "sonner";

export async function fetchAppointments(filters: AppointmentFilters): Promise<Appointment[]> {
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
    
    // Get the data
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
}

export async function getAppointmentsCount(filters: AppointmentFilters): Promise<number> {
  try {
    let query = supabase
      .from('appointments_view')
      .select('*', { count: 'exact', head: true });
    
    // Apply the same filters as in fetchAppointments
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
    
    const { count, error } = await query;
    
    if (error) {
      console.error('Error getting count:', error);
      throw error;
    }
    
    console.log("Total appointments count:", count);
    return count || 0;
  } catch (error) {
    console.error('Error in getAppointmentsCount:', error);
    return 0;
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Statut du rendez-vous mis à jour');
    return true;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    toast.error('Erreur lors de la mise à jour du statut');
    return false;
  }
}

export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Rendez-vous supprimé');
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    toast.error('Erreur lors de la suppression du rendez-vous');
    return false;
  }
}
