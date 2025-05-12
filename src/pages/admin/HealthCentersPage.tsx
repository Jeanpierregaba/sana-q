
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
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, Pencil, Trash, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

// Types pour les centres de santé
type HealthCenter = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  created_by: string | null;
  created_at: string;
};

// Schéma de validation pour le formulaire de centre de santé
const healthCenterSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  address: z.string().min(3, { message: "L'adresse doit contenir au moins 3 caractères" }),
  city: z.string().min(2, { message: "La ville doit contenir au moins 2 caractères" }),
  country: z.string().min(2, { message: "Le pays doit contenir au moins 2 caractères" }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Format d'email invalide" }).optional().or(z.literal("")),
});

type HealthCenterFormValues = z.infer<typeof healthCenterSchema>;

const HealthCentersPage = () => {
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();

  const form = useForm<HealthCenterFormValues>({
    resolver: zodResolver(healthCenterSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
    },
  });

  // Charger les centres de santé
  useEffect(() => {
    const fetchHealthCenters = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('health_centers')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setHealthCenters(data || []);
      } catch (error: any) {
        console.error("Error fetching health centers:", error);
        toast.error("Erreur lors du chargement des centres de santé");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthCenters();
  }, []);

  // Réinitialiser le formulaire quand le centre sélectionné change
  useEffect(() => {
    if (selectedCenter) {
      form.reset({
        name: selectedCenter.name,
        address: selectedCenter.address,
        city: selectedCenter.city,
        country: selectedCenter.country,
        phone: selectedCenter.phone || "",
        email: selectedCenter.email || "",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        city: "",
        country: "",
        phone: "",
        email: "",
      });
    }
  }, [selectedCenter, form]);

  // Gérer la création/modification d'un centre de santé
  const onSubmit = async (values: HealthCenterFormValues) => {
    try {
      if (selectedCenter) {
        // Mise à jour
        const { error } = await supabase
          .from('health_centers')
          .update({
            name: values.name,
            address: values.address,
            city: values.city,
            country: values.country,
            phone: values.phone || null,
            email: values.email || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCenter.id);
        
        if (error) throw error;
        
        toast.success("Centre de santé mis à jour avec succès");
        
        // Mettre à jour la liste locale
        setHealthCenters(healthCenters.map(center => 
          center.id === selectedCenter.id 
            ? { ...center, ...values } 
            : center
        ));
      } else {
        // Création
        const { data, error } = await supabase
          .from('health_centers')
          .insert({
            name: values.name,
            address: values.address,
            city: values.city,
            country: values.country,
            phone: values.phone || null,
            email: values.email || null,
            created_by: user?.id || null
          })
          .select();
        
        if (error) throw error;
        
        toast.success("Centre de santé créé avec succès");
        
        // Ajouter à la liste locale
        if (data) {
          setHealthCenters([...healthCenters, data[0]]);
        }
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving health center:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement du centre de santé");
    }
  };

  // Supprimer un centre de santé
  const handleDelete = async () => {
    if (!selectedCenter) return;
    
    try {
      // Vérifier d'abord si ce centre a des praticiens associés
      const { count, error: countError } = await supabase
        .from('practitioner_centers')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', selectedCenter.id);
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast.error(`Ce centre a ${count} praticien(s) associé(s). Retirez-les d'abord avant de supprimer le centre.`);
        setIsDeleteDialogOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from('health_centers')
        .delete()
        .eq('id', selectedCenter.id);
      
      if (error) throw error;
      
      toast.success("Centre de santé supprimé avec succès");
      
      // Mettre à jour la liste locale
      setHealthCenters(healthCenters.filter(center => center.id !== selectedCenter.id));
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting health center:", error);
      toast.error(error.message || "Erreur lors de la suppression du centre de santé");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Centres de Santé</h2>
          <p className="text-muted-foreground">
            Gérez les centres de santé partenaires de la plateforme.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCenter(null);
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
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthCenters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Aucun centre de santé trouvé
                  </TableCell>
                </TableRow>
              ) : (
                healthCenters.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{center.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{center.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {center.city}, {center.country}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {center.email && <p className="text-sm">{center.email}</p>}
                      {center.phone && <p className="text-sm">{center.phone}</p>}
                      {!center.email && !center.phone && (
                        <Badge variant="outline" className="text-xs">
                          Aucun contact
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            setSelectedCenter(center);
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
                            setSelectedCenter(center);
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
              {selectedCenter ? "Modifier le centre" : "Ajouter un centre de santé"}
            </DialogTitle>
            <DialogDescription>
              {selectedCenter
                ? "Modifiez les informations du centre de santé ci-dessous."
                : "Remplissez le formulaire pour ajouter un nouveau centre de santé."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du centre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du centre de santé" {...field} />
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
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="Pays" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro de téléphone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email du centre" type="email" {...field} />
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
              Êtes-vous sûr de vouloir supprimer ce centre de santé ? Cette action est irréversible.
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

export default HealthCentersPage;
