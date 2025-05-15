
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Appointment, AppointmentStatus } from "@/types/appointments";
import { getStatusColor, getStatusLabel } from "@/utils/appointmentUtils";
import { StatusDropdownMenu } from "./StatusDropdownMenu";

interface AppointmentRowProps {
  appointment: Appointment;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => Promise<boolean>;
  onDeleteClick: (id: string) => void;
  processingId: string | null;
  processingAction: boolean;
}

export function AppointmentRow({
  appointment,
  onStatusChange,
  onDeleteClick,
  processingId,
  processingAction
}: AppointmentRowProps) {
  return (
    <TableRow key={appointment.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {appointment.patient_first_name?.[0] || ""}
              {appointment.patient_last_name?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {appointment.patient_first_name} {appointment.patient_last_name}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">
            {appointment.practitioner_first_name} {appointment.practitioner_last_name}
          </p>
          <Badge variant="outline">{appointment.practitioner_speciality}</Badge>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{appointment.center_name}</p>
          <p className="text-sm text-muted-foreground">{appointment.center_city}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            {format(parseISO(appointment.start_time), 'dd MMMM yyyy', { locale: fr })}
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            {format(parseISO(appointment.start_time), 'HH:mm', { locale: fr })}
            {' - '}
            {format(parseISO(appointment.end_time), 'HH:mm', { locale: fr })}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(appointment.status as AppointmentStatus)}`}>
          {getStatusLabel(appointment.status as AppointmentStatus)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <StatusDropdownMenu
          appointmentId={appointment.id}
          currentStatus={appointment.status as AppointmentStatus}
          onStatusChange={onStatusChange}
          onDeleteClick={onDeleteClick}
          processingId={processingId}
          processingAction={processingAction}
        />
      </TableCell>
    </TableRow>
  );
}
