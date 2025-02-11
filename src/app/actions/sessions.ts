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

// More deterministic for title generation
const titleModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.3,
});

// More creative for research prompt generation
const promptModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.7,
});

const titleTemplate = ChatPromptTemplate.fromMessages([
  ["system", `Given a user's research question or topic, generate a concise and descriptive title that captures the main focus. The title should be clear, professional, and no longer than 50 characters.

User message: {message}

Generate a concise title.`],
]);

const titleChain = RunnableSequence.from([
  {
    message: (input: { message: string }) => input.message,
  },
  titleTemplate,
  titleModel,
  new StringOutputParser(),
]);

const researchPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `Given a research topic and the user's original question, create a detailed and focused prompt that will help initiate productive research. The prompt should:
- Build upon the user's original question
- Add relevant context and considerations
- Frame the question in a way that encourages deep exploration
- Maintain academic rigor while being clear and approachable

Title: {title}
Original Question: {message}

Generate a comprehensive research prompt that will guide this investigation effectively.`],
]);

const researchPromptChain = RunnableSequence.from([
  {
    title: (input: { title: string; message: string }) => input.title,
    message: (input: { title: string; message: string }) => input.message,
  },
  researchPromptTemplate,
  promptModel,
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
    // Generate a concise title from the message
    const title = await titleChain.invoke({
      message,
    });
    
    // Create the session with the generated title
    const session = await createSession(userId, title, message);

    // Generate a comprehensive research prompt using both title and message
    const prompt = await researchPromptChain.invoke({
      title,
      message,
    });

    return {
      success: true,
      session,
      prompt,
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
    // Generate a comprehensive research prompt
    const prompt = await researchPromptChain.invoke({
      title,
      message: description,
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
