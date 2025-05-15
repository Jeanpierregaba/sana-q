
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export function AppointmentsTableHeader() {
  return (
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
  );
}
