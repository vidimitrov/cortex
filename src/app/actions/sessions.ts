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

export async function createSessionFromMessage(
  userId: string,
  message: string
): Promise<CreateSessionResponse> {
  try {
    // Use the first 50 characters of the message as the title
    const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
    
    // Create the session with the message as both title and description
    const session = await createSession(userId, title, message);

    return {
      success: true,
      session,
      prompt: message,
    };
  } catch (error) {
    console.error("Error creating session from message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create session",
    };
  }
}

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

export async function updateSessionTitle(sessionId: string, title: string) {
  try {
    const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await adminClient
      .from("sessions")
      .update({ title })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      session: data
    };
  } catch (error) {
    console.error("Error updating session title:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update session title"
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

    // Delete the session which will cascade delete all related resources
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
