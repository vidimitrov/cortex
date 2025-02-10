"use server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function deleteResearchSession(sessionId: string) {
  try {
    // Create admin client that bypasses RLS
    const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // First try to delete messages since they might have stricter RLS policies
    const { error: messagesError } = await adminClient
      .from("messages")
      .delete()
      .eq("session_id", sessionId);
    
    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      // Continue with session deletion even if messages deletion fails
      // The ON DELETE CASCADE should handle it
    }

    // Delete the session which will cascade delete other resources
    const { error: sessionError } = await adminClient
      .from("sessions")
      .delete()
      .eq("id", sessionId);
    
    if (sessionError) {
      console.error("Error deleting session:", sessionError);
      throw sessionError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete session";
    return { 
      success: false, 
      error: errorMessage
    };
  }
}
