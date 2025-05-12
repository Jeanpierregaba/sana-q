
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil, Trash } from "lucide-react";
import { PractitionerWithProfile } from "@/hooks/usePractitionersData";

interface PractitionerTableProps {
  practitioners: PractitionerWithProfile[];
  isLoading: boolean;
  onEditPractitioner: (practitioner: PractitionerWithProfile) => void;
  onDeletePractitioner: (practitioner: PractitionerWithProfile) => void;
}

export function PractitionerTable({
  practitioners,
  isLoading,
  onEditPractitioner,
  onDeletePractitioner
}: PractitionerTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Praticien</TableHead>
            <TableHead>Spécialité</TableHead>
            <TableHead className="text-center">Années d'expérience</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {practitioners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Aucun praticien trouvé
              </TableCell>
            </TableRow>
          ) : (
            practitioners.map((practitioner) => (
              <TableRow key={practitioner.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={practitioner.avatar_url || undefined} />
                      <AvatarFallback>
                        {practitioner.first_name?.[0] || ""}
                        {practitioner.last_name?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {practitioner.first_name} {practitioner.last_name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{practitioner.speciality}</TableCell>
                <TableCell className="text-center">{practitioner.experience_years} ans</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEditPractitioner(practitioner)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => onDeletePractitioner(practitioner)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
