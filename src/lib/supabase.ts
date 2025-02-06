import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSessions(userId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSession(id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSession(
  userId: string,
  title: string,
  description: string
) {
  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .insert([
      {
        user_id: userId,
        title,
        description,
      },
    ])
    .select()
    .single();

  if (sessionError) {
    console.error("Error creating session:", sessionError);
    throw sessionError;
  }
  return sessionData;
}

export async function getKnowledgePieces(sessionId: string) {
  const { data, error } = await supabase
    .from("knowledge_pieces")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createKnowledgePiece(
  sessionId: string,
  structuredOutput: string
) {
  const { data, error } = await supabase.from("knowledge_pieces").insert([
    {
      session_id: sessionId,
      structured_output: structuredOutput,
    },
  ]);

  if (error) throw error;
  return data;
}
