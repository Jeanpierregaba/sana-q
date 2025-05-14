
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Practitioner = {
  id: string;
  user_id: string;
  speciality: string;
  experience_years: number;
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
};

export type HealthCenter = {
  id: string;
  name: string;
  address: string;
  city: string;
};

export type PractitionerCenter = {
  id: string;
  practitioner_id: string;
  center_id: string;
  created_at: string;
  practitioner?: Practitioner;
  health_center?: HealthCenter;
};

export const usePractitionerCenters = () => {
  const [practitionerCenters, setPractitionerCenters] = useState<PractitionerCenter[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPractitionerCenters = async () => {
      setIsLoading(true);
      try {
        // Fetch practitioner-center associations with joins
        const { data: associations, error: associationsError } = await supabase
          .from('practitioner_centers')
          .select(`
            id,
            practitioner_id,
            center_id,
            created_at,
            practitioners:practitioner_id (
              id,
              user_id,
              speciality,
              experience_years,
              profiles:user_id (
                first_name,
                last_name
              )
            ),
            health_centers:center_id (
              id,
              name,
              address,
              city
            )
          `);

        if (associationsError) throw associationsError;
        console.log("Fetched associations:", associations);

        // Format the data for the component
        const formattedAssociations = associations?.map((assoc) => ({
          id: assoc.id,
          practitioner_id: assoc.practitioner_id,
          center_id: assoc.center_id,
          created_at: assoc.created_at,
          practitioner: assoc.practitioners,
          health_center: assoc.health_centers
        })) || [];

        setPractitionerCenters(formattedAssociations);

        // Fetch all practitioners for the dropdown
        const { data: practitionersData, error: practitionersError } = await supabase
          .from('practitioners')
          .select(`
            id,
            user_id,
            speciality,
            experience_years,
            profiles:user_id (
              first_name,
              last_name
            )
          `);

        if (practitionersError) throw practitionersError;
        console.log("Fetched practitioners:", practitionersData);

        setPractitioners(practitionersData || []);

        // Fetch all health centers for the dropdown
        const { data: centersData, error: centersError } = await supabase
          .from('health_centers')
          .select('id, name, address, city');

        if (centersError) throw centersError;
        console.log("Fetched centers:", centersData);

        setCenters(centersData || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPractitionerCenters();
  }, []);

  const createAssociation = async (practitioner_id: string, center_id: string) => {
    try {
      // Check if association already exists
      const { data: existing, error: checkError } = await supabase
        .from('practitioner_centers')
        .select('*')
        .eq('practitioner_id', practitioner_id)
        .eq('center_id', center_id);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        toast.error("Cette association existe déjà");
        return;
      }

      // Create new association
      const { data, error } = await supabase
        .from('practitioner_centers')
        .insert([{ practitioner_id, center_id }])
        .select(`
          id,
          practitioner_id,
          center_id,
          created_at,
          practitioners:practitioner_id (
            id,
            user_id,
            speciality,
            experience_years,
            profiles:user_id (
              first_name,
              last_name
            )
          ),
          health_centers:center_id (
            id,
            name,
            address,
            city
          )
        `);

      if (error) throw error;

      if (data && data.length > 0) {
        const newAssociation = {
          id: data[0].id,
          practitioner_id: data[0].practitioner_id,
          center_id: data[0].center_id,
          created_at: data[0].created_at,
          practitioner: data[0].practitioners,
          health_center: data[0].health_centers
        };
        
        setPractitionerCenters([...practitionerCenters, newAssociation]);
        toast.success("Association créée avec succès");
      }
    } catch (err: any) {
      console.error("Error creating association:", err);
      toast.error("Erreur lors de la création de l'association");
    }
  };

  const deleteAssociation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('practitioner_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPractitionerCenters(practitionerCenters.filter(pc => pc.id !== id));
      toast.success("Association supprimée avec succès");
    } catch (err: any) {
      console.error("Error deleting association:", err);
      toast.error("Erreur lors de la suppression de l'association");
    }
  };

  return {
    practitionerCenters,
    practitioners,
    centers,
    isLoading,
    error,
    createAssociation,
    deleteAssociation
  };
};
