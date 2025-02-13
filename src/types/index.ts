import { Database } from "./database";

export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type KnowledgePiece =
  Database["public"]["Tables"]["knowledge_pieces"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];

export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export type ResourceType = "text" | "url" | "pdf" | "video";

export type KnowledgePieceType = {
  id: string;
  sessionId: string;
  structuredOutput: string;
  createdAt: string;
};

export type SessionWithResources = Session & {
  resources: Resource[];
};

export type SessionWithKnowledgePieces = Session & {
  knowledgePieces: KnowledgePiece[];
};

export type MessageRole = "user" | "assistant";

export type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  role: MessageRole;
};

export type StreamingMessage = {
  role: MessageRole;
  content: string;
  isStreaming: boolean;
};

export type ChatActionResponse =
  | {
      success: true;
      chunks: string[];
    }
  | {
      success: false;
      error: string;
    };

export type CreateSessionResponse = {
  success: true;
  session: Session;
  prompt: string;
} | {
  success: false;
  error: string;
};
