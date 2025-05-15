
import { Loader2, MoreVertical } from "lucide-react";
import { AppointmentStatus } from "@/types/appointments";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Trash } from "lucide-react";

interface StatusDropdownMenuProps {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => Promise<boolean>;
  onDeleteClick: (id: string) => void;
  processingId: string | null;
  processingAction: boolean;
}

export function StatusDropdownMenu({
  appointmentId,
  currentStatus,
  onStatusChange,
  onDeleteClick,
  processingId,
  processingAction
}: StatusDropdownMenuProps) {
  const isProcessing = processingAction && processingId === appointmentId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={currentStatus === 'scheduled'}
          onClick={() => onStatusChange(appointmentId, 'scheduled')}
        >
          Marquer comme Planifié
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentStatus === 'confirmed'}
          onClick={() => onStatusChange(appointmentId, 'confirmed')}
        >
          Marquer comme Confirmé
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentStatus === 'arrived'}
          onClick={() => onStatusChange(appointmentId, 'arrived')}
        >
          Patient arrivé
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentStatus === 'in_progress'}
          onClick={() => onStatusChange(appointmentId, 'in_progress')}
        >
          En consultation
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentStatus === 'completed'}
          onClick={() => onStatusChange(appointmentId, 'completed')}
        >
          Marquer comme Terminé
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentStatus === 'no_show'}
          onClick={() => onStatusChange(appointmentId, 'no_show')}
        >
          Patient absent
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentStatus === 'cancelled_by_patient'}
          onClick={() => onStatusChange(appointmentId, 'cancelled_by_patient')}
        >
          Annulé par patient
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentStatus === 'cancelled_by_practitioner'}
          onClick={() => onStatusChange(appointmentId, 'cancelled_by_practitioner')}
        >
          Annulé par praticien
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteClick(appointmentId)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
