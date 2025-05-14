
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  user_type: 'patient' | 'doctor' | 'facility' | 'admin';
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string, isAdminLogin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            // Utilisez setTimeout pour éviter les problèmes de récursion avec Supabase
            setTimeout(() => {
              fetchUserProfile(newSession.user!.id);
            }, 0);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast.error("Erreur lors de l'initialisation de l'authentification");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Vérification du statut admin avec la fonction RPC
      const { data: adminData, error: adminError } = await supabase.rpc('is_admin', { uid: userId });
      
      if (adminError) {
        console.error("Error checking admin status:", adminError);
      } else {
        console.log('Is admin check result:', adminData);
        setIsAdmin(adminData);
      }

      // Contournement du problème de récursion infinie: requête directe avec des champs spécifiques
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (userData.user) {
        // Créer un profil à partir des métadonnées de l'utilisateur
        const userMetadata = userData.user.user_metadata;
        
        const userProfile = {
          id: userId,
          first_name: userMetadata?.first_name || null,
          last_name: userMetadata?.last_name || null,
          avatar_url: userMetadata?.avatar_url || null,
          user_type: userMetadata?.user_type || 'patient',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as UserProfile;
        
        console.log('User profile created from metadata:', userProfile);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      toast.error("Erreur lors de la récupération du profil utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            user_type: userData.user_type || "patient",
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Compte créé avec succès! Vérifiez votre email.");
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error(error.message || "Erreur lors de l'inscription");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, isAdminLogin: boolean = false) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Connexion réussie!");
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      toast.error(error.message || "Erreur lors de la connexion");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Déconnexion réussie!");
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error(error.message || "Erreur lors de la déconnexion");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé avec AuthProvider");
  }
  return context;
};
