
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PractitionerOption, type CenterOption } from "@/hooks/usePractitionerCenters";

// Validation schema for the form
const practitionerCenterSchema = z.object({
  practitioner_id: z.string().uuid({ message: "Veuillez sélectionner un praticien" }),
  center_id: z.string().uuid({ message: "Veuillez sélectionner un centre" }),
});

type PractitionerCenterFormValues = z.infer<typeof practitionerCenterSchema>;

interface CreatePractitionerCenterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practitioners: PractitionerOption[];
  centers: CenterOption[];
  onSubmit: (values: PractitionerCenterFormValues) => Promise<void>;
}

export function CreatePractitionerCenterForm({
  open,
  onOpenChange,
  practitioners,
  centers,
  onSubmit
}: CreatePractitionerCenterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PractitionerCenterFormValues>({
    resolver: zodResolver(practitionerCenterSchema),
    defaultValues: {
      practitioner_id: "",
      center_id: "",
    },
  });

  const handleSubmit = async (values: PractitionerCenterFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une association</DialogTitle>
          <DialogDescription>
            Associez un praticien à un centre de santé.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Association..." : "Associer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
