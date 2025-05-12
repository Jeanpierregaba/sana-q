
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePractitionerCenters, type PractitionerCenter } from "@/hooks/usePractitionerCenters";
import { PractitionerCentersTable } from "@/components/admin/PractitionerCentersTable";
import { CreatePractitionerCenterForm } from "@/components/admin/CreatePractitionerCenterForm";
import { DeletePractitionerCenterDialog } from "@/components/admin/DeletePractitionerCenterDialog";

const PractitionerCentersPage = () => {
  const { 
    practitionerCenters, 
    practitioners, 
    centers, 
    isLoading,
    createAssociation,
    deleteAssociation
  } = usePractitionerCenters();

  const [selectedAssociation, setSelectedAssociation] = useState<PractitionerCenter | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateSubmit = async (values: { practitioner_id: string; center_id: string }) => {
    await createAssociation(values.practitioner_id, values.center_id);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteClick = (association: PractitionerCenter) => {
    setSelectedAssociation(association);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAssociation) return;
    await deleteAssociation(selectedAssociation.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Praticiens par Centre</h2>
          <p className="text-muted-foreground">
            Gérez les associations entre praticiens et centres de santé.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>

      <PractitionerCentersTable
        practitionerCenters={practitionerCenters}
        isLoading={isLoading}
        onDeleteClick={handleDeleteClick}
      />

      <CreatePractitionerCenterForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        practitioners={practitioners}
        centers={centers}
        onSubmit={handleCreateSubmit}
      />

      <DeletePractitionerCenterDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default PractitionerCentersPage;
