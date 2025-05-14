
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";

// Type pour les profils patients
type Patient = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  avatar_url: string | null;
  user_type: string;
};

// Schéma de validation pour le formulaire de patient
const patientSchema = z.object({
  first_name: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  last_name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "",
      date_of_birth: "",
      address: "",
    },
  });

  // Charger les patients
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching patients...");
        
        // We query from auth.users via profiles table to get all patients
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'patient');
        
        if (error) {
          console.error("Error fetching patients:", error);
          throw error;
        }
        
        console.log("Patients data:", data);
        setPatients(data || []);
      } catch (error: any) {
        console.error("Error fetching patients:", error);
        toast.error("Erreur lors du chargement des patients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Réinitialiser le formulaire quand le patient sélectionné change
  useEffect(() => {
    if (selectedPatient) {
      form.reset({
        first_name: selectedPatient.first_name || "",
        last_name: selectedPatient.last_name || "",
        gender: selectedPatient.gender || "",
        date_of_birth: selectedPatient.date_of_birth || "",
        address: selectedPatient.address || "",
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        address: "",
      });
    }
  }, [selectedPatient, form]);

  // Gérer la création/modification d'un patient
  const onSubmit = async (values: PatientFormValues) => {
    try {
      if (selectedPatient) {
        // Mise à jour
        const { error } = await supabase
          .from('profiles')
          .update(values)
          .eq('id', selectedPatient.id);
        
        if (error) throw error;
        
        toast.success("Patient mis à jour avec succès");
        
        // Mettre à jour la liste locale
        setPatients(patients.map(p => 
          p.id === selectedPatient.id 
            ? { ...p, ...values } 
            : p
        ));
      } else {
        toast.error("L'ajout de nouveaux patients n'est pas supporté directement. Les utilisateurs doivent s'inscrire eux-mêmes.");
        // Note: La création d'un patient nécessite la création d'un utilisateur avec auth, 
        // ce qui est généralement fait via le processus d'inscription, pas d'admin
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving patient:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement du patient");
    }
  };

  // Supprimer un patient
  const handleDelete = async () => {
    if (!selectedPatient) return;
    
    try {
      // Dans un scénario réel, ceci pourrait être une désactivation au lieu d'une suppression
      // ou une suppression de l'utilisateur via une fonction Supabase spéciale
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'inactive' })
        .eq('id', selectedPatient.id);
      
      if (error) throw error;
      
      toast.success("Patient désactivé avec succès");
      
      // Mettre à jour la liste locale
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      toast.error(error.message || "Erreur lors de la suppression du patient");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Patients</h2>
          <p className="text-muted-foreground">
            Consultez et modifiez les informations des patients.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedPatient(null);
            setIsDialogOpen(true);
          }}
          className="hidden"
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Aucun patient trouvé
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={patient.avatar_url || undefined} />
                          <AvatarFallback>
                            {patient.first_name?.[0] || ""}{patient.last_name?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.gender || "Non spécifié"}</TableCell>
                    <TableCell>
                      {patient.date_of_birth 
                        ? format(new Date(patient.date_of_birth), 'dd/MM/yyyy')
                        : "Non spécifié"}
                    </TableCell>
                    <TableCell>{patient.address || "Non spécifié"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsDeleteDialogOpen(true);
                          }}
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
      )}

      {/* Dialogue de modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPatient ? "Modifier le patient" : "Ajouter un patient"}
            </DialogTitle>
            <DialogDescription>
              {selectedPatient
                ? "Modifiez les informations du patient ci-dessous."
                : "Remplissez le formulaire pour ajouter un nouveau patient."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Homme">Homme</SelectItem>
                          <SelectItem value="Femme">Femme</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Adresse complète" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation de suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désactiver ce patient ? Cette action est réversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Désactiver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsPage;
