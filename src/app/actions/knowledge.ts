"use server";

import { createAdminClient } from "@/lib/supabase";
import { generateKnowledgePiece } from "@/lib/llm";
import { Message } from "@/types";

export async function getKnowledgePiece(sessionId: string) {

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("knowledge_pieces")
    .select("structured_output")
    .eq("session_id", sessionId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows returned
    throw error;
  }

  return data?.structured_output || null;
}

export async function updateKnowledgePiece(
  sessionId: string,
  messages: Message[]
) {
  try {
    // Get current knowledge piece if it exists
    const currentKnowledgePiece = await getKnowledgePiece(sessionId);

    // Generate new knowledge piece
    const newKnowledgePiece = await generateKnowledgePiece(
      currentKnowledgePiece,
      messages
    );

    // Upsert the knowledge piece
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("knowledge_pieces")
      .upsert(
        {
          session_id: sessionId,
          structured_output: newKnowledgePiece,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "session_id" }
      );

    if (error) throw error;

    return newKnowledgePiece;
  } catch (error) {
    console.error("Error updating knowledge piece:", error);
    throw error;
  }
}
