"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
        });
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const { data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
        });
        router.push("/dashboard");
      }
    },
    signUp: async (email: string, password: string) => {
      const { data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
        });
        router.push("/dashboard");
      }
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
