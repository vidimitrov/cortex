"use server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnableSequence } from "langchain/schema/runnable";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.7,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `Given a research topic with the following title and description, create a clear, focused question that will help initiate productive research on this topic. The question should be specific enough to guide the research but open-ended enough to encourage exploration.

Title: {title}
Description: {description}

Generate a research-oriented question that will help explore this topic effectively.`],
]);

const promptChain = RunnableSequence.from([
  {
    title: (input: { title: string; description: string }) => input.title,
    description: (input: { title: string; description: string }) => input.description,
  },
  promptTemplate,
  model,
  new StringOutputParser(),
]);

export async function createSession(userId: string, title: string, description: string) {
  const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await adminClient
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

  if (error) throw error;
  return data;
}

import { CreateSessionResponse } from "@/types";

export async function createSessionWithPrompt(
  userId: string,
  title: string,
  description: string
): Promise<CreateSessionResponse> {
  try {
    // Generate the research prompt
    const prompt = await promptChain.invoke({
      title,
      description,
    });

    // Create the session
    const session = await createSession(userId, title, description);

    return {
      success: true,
      session,
      prompt,
    };
  } catch (error) {
    console.error("Error creating session with prompt:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create session",
    };
  }
}

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
