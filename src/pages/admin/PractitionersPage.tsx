
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { usePractitionersData } from "@/hooks/usePractitionersData";
import { PractitionerTable } from "@/components/admin/practitioners/PractitionerTable";
import { PractitionerForm } from "@/components/admin/practitioners/PractitionerForm";
import { DeletePractitionerDialog } from "@/components/admin/practitioners/DeletePractitionerDialog";

const PractitionersPage = () => {
  const {
    practitioners,
    availableUsers,
    isLoading,
    selectedPractitioner,
    setSelectedPractitioner,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    savePractitioner,
    deletePractitioner
  } = usePractitionersData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Praticiens</h2>
          <p className="text-muted-foreground">
            Consultez, créez et modifiez les informations des praticiens.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedPractitioner(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>

      <PractitionerTable 
        practitioners={practitioners}
        isLoading={isLoading}
        onEditPractitioner={(practitioner) => {
          setSelectedPractitioner(practitioner);
          setIsDialogOpen(true);
        }}
        onDeletePractitioner={(practitioner) => {
          setSelectedPractitioner(practitioner);
          setIsDeleteDialogOpen(true);
        }}
      />

      {/* Dialogue de création/modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPractitioner ? "Modifier le praticien" : "Ajouter un praticien"}
            </DialogTitle>
            <DialogDescription>
              {selectedPractitioner
                ? "Modifiez les informations du praticien ci-dessous."
                : "Remplissez le formulaire pour ajouter un nouveau praticien."}
            </DialogDescription>
          </DialogHeader>
          
          <PractitionerForm
            selectedPractitioner={selectedPractitioner}
            availableUsers={availableUsers}
            onSubmit={savePractitioner}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <DeletePractitionerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={deletePractitioner}
      />
    </div>
  );
};

export default PractitionersPage;
