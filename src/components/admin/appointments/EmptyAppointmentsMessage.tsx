
import { TableRow, TableCell } from "@/components/ui/table";

export function EmptyAppointmentsMessage() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
        Aucun rendez-vous trouvé
      </TableCell>
    </TableRow>
  );
}
