
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for practitioners
export type PractitionerWithProfile = {
  id: string;
  speciality: string;
  experience_years: number;
  description: string | null;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export type AvailableUser = {
  id: string;
  name: string;
};

export function usePractitionersData() {
  const [practitioners, setPractitioners] = useState<PractitionerWithProfile[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPractitioner, setSelectedPractitioner] = useState<PractitionerWithProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Charger les praticiens
  useEffect(() => {
    const fetchPractitioners = async () => {
      setIsLoading(true);
      try {
        // Modification de la requête pour éviter la jointure directe
        const { data: practitionersData, error: practitionersError } = await supabase
          .from('practitioners')
          .select(`
            id,
            speciality,
            experience_years,
            description,
            user_id
          `)
          .order('speciality', { ascending: true });
        
        if (practitionersError) throw practitionersError;
        
        if (!practitionersData || practitionersData.length === 0) {
          setPractitioners([]);
          setIsLoading(false);
          return;
        }
        
        // Récupérer les profils séparément
        const userIds = practitionersData.map(p => p.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
        
        if (profilesError) throw profilesError;
        
        // Créer une map pour les données de profil
        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
        
        // Combiner les données
        const combinedData = practitionersData.map(practitioner => {
          const profile = profilesMap.get(practitioner.user_id) || { 
            first_name: null, 
            last_name: null, 
            avatar_url: null 
          };
          
          return {
            ...practitioner,
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url
          };
        });
        
        setPractitioners(combinedData);
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

  // Create or update practitioner
  const savePractitioner = async (values: {
    speciality: string;
    experience_years: number;
    description?: string;
    user_id: string;
  }) => {
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
            ? { 
                ...p, 
                speciality: values.speciality,
                experience_years: values.experience_years,
                description: values.description || null
              } 
            : p
        ));
      } else {
        // Création
        const { data: newPractitioner, error: insertError } = await supabase
          .from('practitioners')
          .insert({
            speciality: values.speciality,
            experience_years: values.experience_years,
            description: values.description,
            user_id: values.user_id,
          })
          .select('id, speciality, experience_years, description, user_id')
          .single();
        
        if (insertError) throw insertError;
        
        // Récupérer les informations de profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', values.user_id)
          .single();
        
        if (profileError) throw profileError;
        
        toast.success("Praticien créé avec succès");
        
        // Ajouter à la liste locale
        if (newPractitioner) {
          const newPractitionerWithProfile: PractitionerWithProfile = {
            ...newPractitioner,
            first_name: profileData?.first_name || null,
            last_name: profileData?.last_name || null,
            avatar_url: profileData?.avatar_url || null
          };
          
          setPractitioners([...practitioners, newPractitionerWithProfile]);
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

  // Delete practitioner
  const deletePractitioner = async () => {
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
        name: `${selectedPractitioner.first_name || ''} ${selectedPractitioner.last_name || ''}`.trim() || selectedPractitioner.user_id
      };
      
      setAvailableUsers([...availableUsers, user]);
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting practitioner:", error);
      toast.error(error.message || "Erreur lors de la suppression du praticien");
    }
  };

  return {
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
  };
}
