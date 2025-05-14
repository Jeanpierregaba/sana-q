
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for the association practitioner-center
export type PractitionerCenter = {
  id: string;
  practitioner_id: string;
  center_id: string;
  practitioner: {
    speciality: string;
    user_id: string;
  };
  center: {
    name: string;
    city: string;
  };
  // Profile properties
  practitioner_first_name: string | null;
  practitioner_last_name: string | null;
  practitioner_avatar_url: string | null;
};

// Types for the selection options
export type PractitionerOption = {
  id: string;
  name: string;
  speciality: string;
};

export type CenterOption = {
  id: string;
  name: string;
  city: string;
};

export function usePractitionerCenters() {
  const [practitionerCenters, setPractitionerCenters] = useState<PractitionerCenter[]>([]);
  const [practitioners, setPractitioners] = useState<PractitionerOption[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load practitioner-center associations
  useEffect(() => {
    const fetchPractitionerCenters = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching practitioner-center associations...");
        
        // Fetch all practitioner-center associations
        const { data: pcData, error: pcError } = await supabase
          .from('practitioner_centers')
          .select(`
            id,
            practitioner_id,
            center_id,
            practitioner:practitioners(
              speciality,
              user_id
            ),
            center:health_centers(
              name,
              city
            )
          `);
        
        if (pcError) {
          console.error("Error fetching practitioner-center associations:", pcError);
          throw pcError;
        }
        
        console.log("Practitioner-center associations:", pcData);
        
        if (!pcData || pcData.length === 0) {
          setPractitionerCenters([]);
          setIsLoading(false);
          return;
        }

        // Fetch profiles separately
        const userIds = pcData
          .map(pc => pc.practitioner?.user_id)
          .filter(Boolean) as string[];
        
        console.log("User IDs to fetch profiles for:", userIds);
        
        if (userIds.length === 0) {
          // If no valid user IDs, set empty array and return
          setPractitionerCenters([]);
          setIsLoading(false);
          return;
        }
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
        
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("Profiles data:", profilesData);
        
        // Create a map for profiles
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
        
        // Combine the data
        const combined = pcData.map(pc => {
          const profile = profilesMap.get(pc.practitioner?.user_id) || { 
            first_name: null, 
            last_name: null, 
            avatar_url: null 
          };
          
          return {
            ...pc,
            practitioner_first_name: profile.first_name,
            practitioner_last_name: profile.last_name,
            practitioner_avatar_url: profile.avatar_url
          };
        });
        
        console.log("Combined practitioner-center data:", combined);
        setPractitionerCenters(combined);
      } catch (error: any) {
        console.error("Error fetching practitioner centers:", error);
        toast.error("Erreur lors du chargement des associations praticien-centre");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPractitionerCenters();
  }, []);

  // Load available practitioners
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        console.log("Fetching practitioners...");
        
        // First, get all practitioners
        const { data: practitionersData, error: practitionersError } = await supabase
          .from('practitioners')
          .select('id, speciality, user_id');
        
        if (practitionersError) {
          console.error("Error fetching practitioners:", practitionersError);
          throw practitionersError;
        }
        
        console.log("Practitioners data:", practitionersData);
        
        if (!practitionersData || practitionersData.length === 0) {
          setPractitioners([]);
          return;
        }

        // Fetch profiles separately
        const userIds = practitionersData
          .map(p => p.user_id)
          .filter(Boolean);
        
        console.log("User IDs for practitioner profiles:", userIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
        
        if (profilesError) {
          console.error("Error fetching practitioner profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("Practitioner profiles data:", profilesData);
        
        // Create a map for profiles
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
        
        // Combine the data
        const practitionerOptions = practitionersData.map(p => {
          const profile = profilesMap.get(p.user_id) || { first_name: null, last_name: null };
          const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sans nom';
          
          return {
            id: p.id,
            name: name,
            speciality: p.speciality
          };
        });
        
        console.log("Practitioner options:", practitionerOptions);
        setPractitioners(practitionerOptions);
      } catch (error) {
        console.error("Error fetching practitioners:", error);
        toast.error("Erreur lors du chargement des praticiens");
      }
    };

    fetchPractitioners();
  }, []);

  // Load health centers
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        console.log("Fetching health centers...");
        
        const { data, error } = await supabase
          .from('health_centers')
          .select('id, name, city')
          .order('name', { ascending: true });
        
        if (error) {
          console.error("Error fetching health centers:", error);
          throw error;
        }
        
        console.log("Health centers data:", data);
        setCenters(data || []);
      } catch (error) {
        console.error("Error fetching health centers:", error);
        toast.error("Erreur lors du chargement des centres de santé");
      }
    };

    fetchCenters();
  }, []);

  // Create a new practitioner-center association
  const createAssociation = async (
    practitioner_id: string, 
    center_id: string
  ) => {
    try {
      // Check if the association already exists
      const { data: existingData, error: existingError } = await supabase
        .from('practitioner_centers')
        .select('id')
        .eq('practitioner_id', practitioner_id)
        .eq('center_id', center_id)
        .maybeSingle();
      
      if (existingError) throw existingError;
      
      if (existingData) {
        toast.error("Cette association praticien-centre existe déjà");
        return null;
      }
      
      // Create
      const { data: insertedData, error: insertError } = await supabase
        .from('practitioner_centers')
        .insert({
          practitioner_id: practitioner_id,
          center_id: center_id
        })
        .select(`
          id,
          practitioner_id,
          center_id
        `)
        .single();
      
      if (insertError) throw insertError;
      
      // Get practitioner data
      const { data: practitionerData, error: practitionerError } = await supabase
        .from('practitioners')
        .select('speciality, user_id')
        .eq('id', practitioner_id)
        .single();
      
      if (practitionerError) throw practitionerError;
      
      // Get center data
      const { data: centerData, error: centerError } = await supabase
        .from('health_centers')
        .select('name, city')
        .eq('id', center_id)
        .single();
      
      if (centerError) throw centerError;
      
      // Get practitioner profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', practitionerData.user_id)
        .single();
      
      if (profileError) throw profileError;
      
      const newAssociation: PractitionerCenter = {
        id: insertedData.id,
        practitioner_id: insertedData.practitioner_id,
        center_id: insertedData.center_id,
        practitioner: {
          speciality: practitionerData.speciality,
          user_id: practitionerData.user_id
        },
        center: {
          name: centerData.name,
          city: centerData.city
        },
        practitioner_first_name: profileData?.first_name || null,
        practitioner_last_name: profileData?.last_name || null,
        practitioner_avatar_url: profileData?.avatar_url || null
      };
      
      toast.success("Association praticien-centre créée avec succès");
      
      // Add to local list
      setPractitionerCenters([...practitionerCenters, newAssociation]);
      return newAssociation;
    } catch (error: any) {
      console.error("Error creating practitioner-center association:", error);
      toast.error(error.message || "Erreur lors de la création de l'association");
      return null;
    }
  };

  // Delete a practitioner-center association
  const deleteAssociation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('practitioner_centers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Association supprimée avec succès");
      
      // Update the local list
      setPractitionerCenters(practitionerCenters.filter(pc => pc.id !== id));
      return true;
    } catch (error: any) {
      console.error("Error deleting practitioner-center association:", error);
      toast.error(error.message || "Erreur lors de la suppression de l'association");
      return false;
    }
  };

  return {
    practitionerCenters,
    practitioners,
    centers,
    isLoading,
    createAssociation,
    deleteAssociation
  };
}
