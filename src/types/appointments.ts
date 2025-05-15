
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
