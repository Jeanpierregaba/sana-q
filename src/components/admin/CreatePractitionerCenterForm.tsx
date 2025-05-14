
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Practitioner, HealthCenter } from "@/hooks/usePractitionerCenters";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  practitioner_id: z.string().min(1, "Veuillez sélectionner un praticien"),
  center_id: z.string().min(1, "Veuillez sélectionner un centre"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePractitionerCenterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practitioners: Practitioner[];
  centers: HealthCenter[];
  onSubmit: (values: FormValues) => Promise<void>;
}

export const CreatePractitionerCenterForm = ({
  open,
  onOpenChange,
  practitioners,
  centers,
  onSubmit,
}: CreatePractitionerCenterFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practitioner_id: "",
      center_id: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Associer un praticien à un centre</DialogTitle>
          <DialogDescription>
            Créez une nouvelle association entre un praticien et un centre de santé.
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
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un praticien" />
                      </SelectTrigger>
                      <SelectContent>
                        {practitioners.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Aucun praticien disponible
                          </div>
                        ) : (
                          practitioners.map((practitioner) => (
                            <SelectItem key={practitioner.id} value={practitioner.id}>
                              {practitioner.profile?.first_name || ''} {practitioner.profile?.last_name || ''}
                              {!practitioner.profile?.first_name && !practitioner.profile?.last_name && 
                                `Praticien ${practitioner.id.substring(0, 8)}`}
                              <span className="ml-2 text-sm text-muted-foreground">
                                ({practitioner.speciality})
                              </span>
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
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un centre" />
                      </SelectTrigger>
                      <SelectContent>
                        {centers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Aucun centre disponible
                          </div>
                        ) : (
                          centers.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name} 
                              <span className="ml-2 text-sm text-muted-foreground">
                                ({center.city})
                              </span>
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

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
