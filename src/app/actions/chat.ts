"use server";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnableSequence } from "langchain/schema/runnable";
import { ChatPromptTemplate } from "langchain/prompts";
import { ChatActionResponse } from "@/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.5,
  streaming: true,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI research assistant. Your responses should be informative and engaging."],
  ["human", "{input}"],
]);

const chatChain = RunnableSequence.from([
  {
    input: (input: { input: string }) => input.input,
  },
  prompt,
  model,
  new StringOutputParser(),
]);

export async function streamChatAction(
  prevState: any,
  formData: FormData
): Promise<ChatActionResponse> {
  try {
    const input = formData.get("message") as string;
    if (!input) throw new Error("No message provided");

    const stream = await chatChain.stream({
      input: input,
    });

    // Convert AsyncIterable to array of chunks
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return { success: true, chunks };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
