
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PractitionerWithProfile, AvailableUser } from "@/hooks/usePractitionersData";

// Schéma de validation pour le formulaire de praticien
const practitionerSchema = z.object({
  speciality: z.string().min(2, { message: "La spécialité doit contenir au moins 2 caractères" }),
  experience_years: z.coerce.number().min(0, { message: "L'expérience ne peut pas être négative" }),
  description: z.string().optional(),
  user_id: z.string().uuid({ message: "ID utilisateur invalide" }),
});

type PractitionerFormValues = z.infer<typeof practitionerSchema>;

interface PractitionerFormProps {
  selectedPractitioner: PractitionerWithProfile | null;
  availableUsers: AvailableUser[];
  onSubmit: (values: PractitionerFormValues) => Promise<void>;
  onCancel: () => void;
}

export function PractitionerForm({
  selectedPractitioner,
  availableUsers,
  onSubmit,
  onCancel
}: PractitionerFormProps) {
  const form = useForm<PractitionerFormValues>({
    resolver: zodResolver(practitionerSchema),
    defaultValues: {
      speciality: "",
      experience_years: 0,
      description: "",
      user_id: "",
    },
  });

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

  return (
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
          <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
