
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";

// Types pour les praticiens
type PractitionerWithProfile = {
  id: string;
  speciality: string;
  experience_years: number;
  description: string | null;
  user_id: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
};

// Schéma de validation pour le formulaire de praticien
const practitionerSchema = z.object({
  speciality: z.string().min(2, { message: "La spécialité doit contenir au moins 2 caractères" }),
  experience_years: z.coerce.number().min(0, { message: "L'expérience ne peut pas être négative" }),
  description: z.string().optional(),
  user_id: z.string().uuid({ message: "ID utilisateur invalide" }),
});

type PractitionerFormValues = z.infer<typeof practitionerSchema>;

const PractitionersPage = () => {
  const [practitioners, setPractitioners] = useState<PractitionerWithProfile[]>([]);
  const [availableUsers, setAvailableUsers] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPractitioner, setSelectedPractitioner] = useState<PractitionerWithProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<PractitionerFormValues>({
    resolver: zodResolver(practitionerSchema),
    defaultValues: {
      speciality: "",
      experience_years: 0,
      description: "",
      user_id: "",
    },
  });

  // Charger les praticiens
  useEffect(() => {
    const fetchPractitioners = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('practitioners')
          .select(`
            id,
            speciality,
            experience_years,
            description,
            user_id,
            profile:profiles(first_name, last_name, avatar_url)
          `)
          .order('speciality', { ascending: true });
        
        if (error) throw error;
        
        setPractitioners(data || []);
      } catch (error: any) {
        console.error("Error fetching practitioners:", error);
        toast.error("Erreur lors du chargement des praticiens");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPractitioners();
  }, []);

  // Charger les utilisateurs disponibles pour devenir praticiens
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        // Récupérer tous les profils qui ne sont pas encore praticiens
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name
          `)
          .not('user_type', 'eq', 'admin');
        
        if (profilesError) throw profilesError;

        // Récupérer tous les praticiens existants pour exclure leurs IDs
        const { data: existingPractitioners, error: practitionersError } = await supabase
          .from('practitioners')
          .select('user_id');
        
        if (practitionersError) throw practitionersError;

        // Filtrer pour ne garder que les utilisateurs qui ne sont pas déjà praticiens
        const existingPractitionerIds = existingPractitioners.map(p => p.user_id);
        const filteredProfiles = profiles.filter(p => !existingPractitionerIds.includes(p.id));

        setAvailableUsers(filteredProfiles.map(p => ({
          id: p.id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.id
        })));
      } catch (error) {
        console.error("Error fetching available users:", error);
      }
    };

    fetchAvailableUsers();
  }, []);

  // Réinitialiser le formulaire quand le praticien sélectionné change
  useEffect(() => {
    if (selectedPractitioner) {
      form.reset({
        speciality: selectedPractitioner.speciality,
        experience_years: selectedPractitioner.experience_years,
        description: selectedPractitioner.description || "",
        user_id: selectedPractitioner.user_id,
      });
    } else {
      form.reset({
        speciality: "",
        experience_years: 0,
        description: "",
        user_id: "",
      });
    }
  }, [selectedPractitioner, form]);

  // Gérer la création/modification d'un praticien
  const onSubmit = async (values: PractitionerFormValues) => {
    try {
      if (selectedPractitioner) {
        // Mise à jour
        const { error } = await supabase
          .from('practitioners')
          .update({
            speciality: values.speciality,
            experience_years: values.experience_years,
            description: values.description,
          })
          .eq('id', selectedPractitioner.id);
        
        if (error) throw error;
        
        toast.success("Praticien mis à jour avec succès");
        
        // Mettre à jour la liste locale
        setPractitioners(practitioners.map(p => 
          p.id === selectedPractitioner.id 
            ? { ...p, ...values } 
            : p
        ));
      } else {
        // Création
        const { data, error } = await supabase
          .from('practitioners')
          .insert({
            speciality: values.speciality,
            experience_years: values.experience_years,
            description: values.description,
            user_id: values.user_id,
          })
          .select(`
            id,
            speciality,
            experience_years,
            description,
            user_id,
            profile:profiles(first_name, last_name, avatar_url)
          `)
          .single();
        
        if (error) throw error;
        
        toast.success("Praticien créé avec succès");
        
        // Ajouter à la liste locale
        if (data) {
          setPractitioners([...practitioners, data]);
        }
        
        // Mettre à jour la liste des utilisateurs disponibles
        setAvailableUsers(availableUsers.filter(u => u.id !== values.user_id));
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving practitioner:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement du praticien");
    }
  };

  // Supprimer un praticien
  const handleDelete = async () => {
    if (!selectedPractitioner) return;
    
    try {
      const { error } = await supabase
        .from('practitioners')
        .delete()
        .eq('id', selectedPractitioner.id);
      
      if (error) throw error;
      
      toast.success("Praticien supprimé avec succès");
      
      // Mettre à jour la liste locale
      setPractitioners(practitioners.filter(p => p.id !== selectedPractitioner.id));
      
      // Ajouter l'utilisateur à la liste des utilisateurs disponibles
      const user = {
        id: selectedPractitioner.user_id,
        name: `${selectedPractitioner.profile.first_name || ''} ${selectedPractitioner.profile.last_name || ''}`.trim()
      };
      
      setAvailableUsers([...availableUsers, user]);
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting practitioner:", error);
      toast.error(error.message || "Erreur lors de la suppression du praticien");
    }
  };

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

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
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
                          <AvatarImage src={practitioner.profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {practitioner.profile.first_name?.[0] || ""}
                            {practitioner.profile.last_name?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {practitioner.profile.first_name} {practitioner.profile.last_name}
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
                          onClick={() => {
                            setSelectedPractitioner(practitioner);
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
                            setSelectedPractitioner(practitioner);
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!selectedPractitioner && (
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utilisateur</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Sélectionnez un utilisateur</option>
                          {availableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="speciality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spécialité</FormLabel>
                    <FormControl>
                      <Input placeholder="Spécialité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Années d'expérience</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de l'expérience et des compétences" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
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
              Êtes-vous sûr de vouloir supprimer ce praticien ? Cette action ne supprime pas le compte utilisateur associé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PractitionersPage;
