
import { AppointmentStatus } from "@/types/appointments";

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
