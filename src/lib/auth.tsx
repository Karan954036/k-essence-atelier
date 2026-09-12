import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SupabaseUser = any;

type AuthContextType = {
  user: SupabaseUser | null;
  isLoading: boolean;
  signUp: (opts: { email: string; password: string; fullName?: string }) => Promise<any>;
  signIn: (opts: { email: string; password: string }) => Promise<any>;
  signOut: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<any>;
  getSessionFromUrl: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(data.session?.user ?? null);
      } catch (e) {
        console.error("Auth init error", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      try {
        subscription.unsubscribe();
      } catch {}
    };
  }, []);

  async function signUp({ email, password, fullName }: { email: string; password: string; fullName?: string }) {
    // Pass fullName into user_metadata so we have it available immediately in the auth user
    return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  }

  async function signIn({ email, password }: { email: string; password: string }) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  async function sendPasswordReset(email: string) {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    return supabase.auth.resetPasswordForEmail(email, { redirectTo });
  }

  async function getSessionFromUrl() {
    if (!supabase?.auth?.getSessionFromUrl) return null;
    return supabase.auth.getSessionFromUrl();
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut, sendPasswordReset, getSessionFromUrl }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
