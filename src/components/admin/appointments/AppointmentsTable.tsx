
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MoreVertical, Trash, Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  type Appointment, 
  type AppointmentStatus, 
  getStatusLabel, 
  getStatusColor 
} from "@/hooks/useAppointments";

interface AppointmentsTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => Promise<boolean>;
  onDeleteAppointment: (id: string) => Promise<boolean>;
}

export function AppointmentsTable({
  appointments,
  isLoading,
  onStatusChange,
  onDeleteAppointment
}: AppointmentsTableProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string | null;
    action: 'delete' | null;
    status?: AppointmentStatus;
  }>({
    open: false,
    appointmentId: null,
    action: null,
  });
  
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setProcessingAction(true);
    setProcessingId(id);
    
    const success = await onStatusChange(id, newStatus);
    
    setProcessingAction(false);
    setProcessingId(null);
    
    if (success) {
      setConfirmDialog({
        open: false,
        appointmentId: null,
        action: null
      });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (confirmDialog.appointmentId) {
      setProcessingAction(true);
      
      const success = await onDeleteAppointment(confirmDialog.appointmentId);
      
      setProcessingAction(false);
      
      if (success) {
        setConfirmDialog({
          open: false,
          appointmentId: null,
          action: null
        });
      }
    }
  };
  
  const confirmDelete = (appointmentId: string) => {
    setConfirmDialog({
      open: true,
      appointmentId,
      action: 'delete'
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Praticien</TableHead>
              <TableHead>Centre</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Aucun rendez-vous trouvé
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          {processingAction && processingId === appointment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={appointment.status === 'scheduled'}
                          onClick={() => handleStatusChange(appointment.id, 'scheduled')}
                        >
                          Marquer comme Planifié
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={appointment.status === 'confirmed'}
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        >
                          Marquer comme Confirmé
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={appointment.status === 'arrived'}
                          onClick={() => handleStatusChange(appointment.id, 'arrived')}
                        >
                          Patient arrivé
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={appointment.status === 'in_progress'}
                          onClick={() => handleStatusChange(appointment.id, 'in_progress')}
                        >
                          En consultation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={appointment.status === 'completed'}
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                        >
                          Marquer comme Terminé
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={appointment.status === 'no_show'}
                          onClick={() => handleStatusChange(appointment.id, 'no_show')}
                        >
                          Patient absent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={appointment.status === 'cancelled_by_patient'}
                          onClick={() => handleStatusChange(appointment.id, 'cancelled_by_patient')}
                        >
                          Annulé par patient
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={appointment.status === 'cancelled_by_practitioner'}
                          onClick={() => handleStatusChange(appointment.id, 'cancelled_by_practitioner')}
                        >
                          Annulé par praticien
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => confirmDelete(appointment.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation de suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, appointmentId: null, action: null })}
              disabled={processingAction}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={processingAction}
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
