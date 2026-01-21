"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";
import type { AuthContextType, Profile, Organization, OrganizationSettings } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    setProfile(data);
    return data;
  }, [supabase]);

  const fetchOrganization = useCallback(async (organizationId: string) => {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    setOrganization(data);
    return data;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const refreshOrganization = useCallback(async () => {
    if (profile?.organization_id) {
      await fetchOrganization(profile.organization_id);
    }
  }, [profile, fetchOrganization]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id);
          if (profileData?.organization_id) {
            await fetchOrganization(profileData.organization_id);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id);
          if (profileData?.organization_id) {
            await fetchOrganization(profileData.organization_id);
          }
        } else {
          setProfile(null);
          setOrganization(null);
        }

        if (event === "SIGNED_OUT") {
          setProfile(null);
          setOrganization(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, fetchOrganization]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrganization(null);
  };

  // Check if setup is completed
  const settings = (organization?.settings as OrganizationSettings) || {};
  const hasCompletedSetup = !!settings.setup_completed_at || !!settings.setup_skipped_at;

  const value: AuthContextType = {
    user,
    profile,
    organization,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedSetup,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    refreshOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
