
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash, Building } from "lucide-react";
import { type PractitionerCenter } from "@/hooks/usePractitionerCenters";

interface PractitionerCentersTableProps {
  practitionerCenters: PractitionerCenter[];
  isLoading: boolean;
  onDeleteClick: (association: PractitionerCenter) => void;
}

export function PractitionerCentersTable({ 
  practitionerCenters, 
  isLoading, 
  onDeleteClick 
}: PractitionerCentersTableProps) {
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
            <TableHead>Centre de santé</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {practitionerCenters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Aucune association praticien-centre trouvée
              </TableCell>
            </TableRow>
          ) : (
            practitionerCenters.map((pc) => (
              <TableRow key={pc.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={pc.practitioner?.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {pc.practitioner?.profile?.first_name?.[0] || ""}
                        {pc.practitioner?.profile?.last_name?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {pc.practitioner?.profile?.first_name} {pc.practitioner?.profile?.last_name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{pc.practitioner?.speciality}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{pc.health_center?.name}</p>
                      <p className="text-sm text-muted-foreground">{pc.health_center?.city}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteClick(pc)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
