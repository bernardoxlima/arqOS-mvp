import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/shared/lib/supabase/database.types";

export type Profile = Tables<"profiles">;
export type Organization = Tables<"organizations">;

export interface OrganizationSettings {
  setup_completed_at?: string | null;
  setup_skipped_at?: string | null;
  setup_step?: number;
  office?: {
    size: string;
    margin: number;
    services: string[];
    costs: Record<string, number>;
  };
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedSetup: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}
