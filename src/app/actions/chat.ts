"use server";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnableSequence } from "langchain/schema/runnable";
import { ChatPromptTemplate } from "langchain/prompts";
import { ChatActionResponse, Message, MessageRole } from "@/types";
import { findSimilarMessages } from "./embeddings";
import { updateKnowledgePiece } from "./knowledge";
import { getMessages } from "@/lib/supabase";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.5,
  streaming: true,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI research assistant. Your responses should be informative and engaging. Below is relevant context from previous messages in this conversation that may help inform your response:"],
  ["system", "{context}"],
  ["human", "{input}"],
]);

const chatChain = RunnableSequence.from([
  {
    input: (input: { input: string; context: string }) => input.input,
    context: (input: { input: string; context: string }) => input.context,
  },
  prompt,
  model,
  new StringOutputParser(),
]);

export async function streamChatAction(
  prevState: ChatActionResponse | null,
  formData: FormData,
  sessionId: string
): Promise<ChatActionResponse> {
  try {
    const input = formData.get("message") as string;
    if (!input) throw new Error("No message provided");

    // Get similar messages for context
    const similarMessages = await findSimilarMessages(sessionId, input);
    
    // Format context from similar messages
    const context = similarMessages.length > 0
      ? "Previous relevant messages:\n" + similarMessages
          .map(msg => `${msg.role}: ${msg.content} (similarity: ${(msg.similarity * 100).toFixed(1)}%)`)
          .join("\n")
      : "No relevant previous messages found.";

    const stream = await chatChain.stream({
      input: input,
      context: context,
    });

    // Convert AsyncIterable to array of chunks
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Get all messages and update the knowledge piece
    const existingMessages = await getMessages(sessionId);
    const allMessages = [...existingMessages, { 
      role: "assistant" as MessageRole, 
      content: chunks.join(""), 
      id: "", 
      created_at: new Date().toISOString(), 
      session_id: sessionId,
      user_id: "system", // Since this is an AI response
      embedding: null // We don't need embedding for knowledge piece generation
    }];
    await updateKnowledgePiece(sessionId, allMessages);

    return { success: true, chunks };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
