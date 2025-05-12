
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
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Trash, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Types pour l'association praticien-centre
type PractitionerCenter = {
  id: string;
  practitioner_id: string;
  center_id: string;
  practitioner: {
    speciality: string;
    profile: {
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  };
  center: {
    name: string;
    city: string;
  };
};

// Types pour les options de sélection
type PractitionerOption = {
  id: string;
  name: string;
  speciality: string;
};

type CenterOption = {
  id: string;
  name: string;
  city: string;
};

// Schéma de validation pour le formulaire
const practitionerCenterSchema = z.object({
  practitioner_id: z.string().uuid({ message: "Veuillez sélectionner un praticien" }),
  center_id: z.string().uuid({ message: "Veuillez sélectionner un centre" }),
});

type PractitionerCenterFormValues = z.infer<typeof practitionerCenterSchema>;

const PractitionerCentersPage = () => {
  const [practitionerCenters, setPractitionerCenters] = useState<PractitionerCenter[]>([]);
  const [practitioners, setPractitioners] = useState<PractitionerOption[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssociation, setSelectedAssociation] = useState<PractitionerCenter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<PractitionerCenterFormValues>({
    resolver: zodResolver(practitionerCenterSchema),
    defaultValues: {
      practitioner_id: "",
      center_id: "",
    },
  });

  // Charger les associations praticien-centre
  useEffect(() => {
    const fetchPractitionerCenters = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('practitioner_centers')
          .select(`
            id,
            practitioner_id,
            center_id,
            practitioner:practitioners(
              speciality,
              profile:profiles(
                first_name,
                last_name,
                avatar_url
              )
            ),
            center:health_centers(
              name,
              city
            )
          `)
          .order('id', { ascending: true });
        
        if (error) throw error;
        
        setPractitionerCenters(data || []);
      } catch (error: any) {
        console.error("Error fetching practitioner centers:", error);
        toast.error("Erreur lors du chargement des associations praticien-centre");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPractitionerCenters();
  }, []);

  // Charger les praticiens disponibles
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const { data, error } = await supabase
          .from('practitioners')
          .select(`
            id,
            speciality,
            profile:profiles(
              first_name,
              last_name
            )
          `);
        
        if (error) throw error;
        
        const practitionerOptions = data.map(p => ({
          id: p.id,
          name: `${p.profile.first_name || ''} ${p.profile.last_name || ''}`.trim(),
          speciality: p.speciality
        }));
        
        setPractitioners(practitionerOptions);
      } catch (error) {
        console.error("Error fetching practitioners:", error);
      }
    };

    fetchPractitioners();
  }, []);

  // Charger les centres de santé
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const { data, error } = await supabase
          .from('health_centers')
          .select('id, name, city')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setCenters(data);
      } catch (error) {
        console.error("Error fetching health centers:", error);
      }
    };

    fetchCenters();
  }, []);

  // Gérer la création d'une association praticien-centre
  const onSubmit = async (values: PractitionerCenterFormValues) => {
    try {
      // Vérifier si l'association existe déjà
      const { data: existingData, error: existingError } = await supabase
        .from('practitioner_centers')
        .select('id')
        .eq('practitioner_id', values.practitioner_id)
        .eq('center_id', values.center_id)
        .maybeSingle();
      
      if (existingError) throw existingError;
      
      if (existingData) {
        toast.error("Cette association praticien-centre existe déjà");
        return;
      }
      
      // Création
      const { data, error } = await supabase
        .from('practitioner_centers')
        .insert({
          practitioner_id: values.practitioner_id,
          center_id: values.center_id
        })
        .select(`
          id,
          practitioner_id,
          center_id,
          practitioner:practitioners(
            speciality,
            profile:profiles(
              first_name,
              last_name,
              avatar_url
            )
          ),
          center:health_centers(
            name,
            city
          )
        `)
        .single();
      
      if (error) throw error;
      
      toast.success("Association praticien-centre créée avec succès");
      
      // Ajouter à la liste locale
      setPractitionerCenters([...practitionerCenters, data]);
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Error creating practitioner-center association:", error);
      toast.error(error.message || "Erreur lors de la création de l'association");
    }
  };

  // Supprimer une association praticien-centre
  const handleDelete = async () => {
    if (!selectedAssociation) return;
    
    try {
      const { error } = await supabase
        .from('practitioner_centers')
        .delete()
        .eq('id', selectedAssociation.id);
      
      if (error) throw error;
      
      toast.success("Association supprimée avec succès");
      
      // Mettre à jour la liste locale
      setPractitionerCenters(practitionerCenters.filter(pc => pc.id !== selectedAssociation.id));
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting practitioner-center association:", error);
      toast.error(error.message || "Erreur lors de la suppression de l'association");
    }
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
        <Button 
          onClick={() => setIsDialogOpen(true)}
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
                          <AvatarImage src={pc.practitioner.profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {pc.practitioner.profile.first_name?.[0] || ""}
                            {pc.practitioner.profile.last_name?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {pc.practitioner.profile.first_name} {pc.practitioner.profile.last_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pc.practitioner.speciality}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{pc.center.name}</p>
                          <p className="text-sm text-muted-foreground">{pc.center.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedAssociation(pc);
                          setIsDeleteDialogOpen(true);
                        }}
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
      )}

      {/* Dialogue de création */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une association</DialogTitle>
            <DialogDescription>
              Associez un praticien à un centre de santé.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="practitioner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Praticien</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un praticien" />
                        </SelectTrigger>
                        <SelectContent>
                          {practitioners.length === 0 ? (
                            <SelectItem value="none" disabled>Aucun praticien disponible</SelectItem>
                          ) : (
                            practitioners.map((practitioner) => (
                              <SelectItem key={practitioner.id} value={practitioner.id}>
                                {practitioner.name} - {practitioner.speciality}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="center_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centre de santé</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un centre de santé" />
                        </SelectTrigger>
                        <SelectContent>
                          {centers.length === 0 ? (
                            <SelectItem value="none" disabled>Aucun centre disponible</SelectItem>
                          ) : (
                            centers.map((center) => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.name} ({center.city})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Associer</Button>
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
              Êtes-vous sûr de vouloir supprimer cette association entre le praticien et le centre de santé ? Cette action est irréversible.
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

export default PractitionerCentersPage;
