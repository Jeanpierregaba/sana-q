
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
  signIn: (email: string, password: string) => Promise<void>;
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
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            fetchUserProfile(newSession.user.id);
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data as UserProfile);
        setIsAdmin(data.user_type === 'admin');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
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

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Navigation se fait automatiquement via l'effet onAuthStateChange
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
