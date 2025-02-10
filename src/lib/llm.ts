import { ChatOpenAI } from "langchain/chat_models/openai";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnableSequence } from "langchain/schema/runnable";
import { ChatPromptTemplate } from "langchain/prompts";
import { Message } from "@/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.5,
  streaming: true,
});

// Prompt for generating/updating knowledge piece
const knowledgePiecePrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are a research assistant tasked with maintaining a concise, well-structured summary of the ongoing research session. 
  Your goal is to create a clear, organized summary that captures the key points, findings, and conclusions from the conversation.
  
  Below is the current summary (if any) and the conversation history. Update or create a new summary that:
  - Maintains a logical flow and structure
  - Highlights key findings and insights
  - Removes redundant information
  - Integrates new information with existing knowledge
  - Uses clear, professional language
  
  Current summary:
  {currentSummary}
  
  Conversation history:
  {conversationHistory}`],
]);

const knowledgePieceChain = RunnableSequence.from([
  {
    currentSummary: (input: { currentSummary: string | null; messages: Message[] }) =>
      input.currentSummary || "No existing summary.",
    conversationHistory: (input: { currentSummary: string | null; messages: Message[] }) =>
      input.messages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n"),
  },
  knowledgePiecePrompt,
  model,
  new StringOutputParser(),
]);

export async function generateKnowledgePiece(
  currentSummary: string | null,
  messages: Message[]
): Promise<string> {
  try {
    const stream = await knowledgePieceChain.stream({
      currentSummary,
      messages,
    });

    // Convert AsyncIterable to string
    let result = "";
    for await (const chunk of stream) {
      result += chunk;
    }

    return result;
  } catch (error) {
    console.error("Error generating knowledge piece:", error);
    throw error;
  }
}
