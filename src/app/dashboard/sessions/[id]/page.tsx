"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Session, Message, StreamingMessage } from "@/types";
import { getSession, getMessages } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deleteResearchSession } from "@/app/actions/sessions";
import { createMessageWithEmbedding } from "@/app/actions/embeddings";
import { streamChatAction } from "@/app/actions/chat";
import { getKnowledgePiece } from "@/app/actions/knowledge";
import ChatInterface from "@/components/chat/ChatInterface";
import SessionHeader from "@/components/dashboard/SessionHeader";
import KnowledgePiece from "@/components/dashboard/KnowledgePiece";

export default function SessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sessionId = pathname.split("/").pop(); // Get the last segment of the URL

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage>();
  const [knowledgePiece, setKnowledgePiece] = useState<string | null>(null);
  const [isUpdatingKnowledge, setIsUpdatingKnowledge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initialPromptSentRef = useRef(false);
  const searchParams = useSearchParams();

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!user || !session) {
        setError("Session not available");
        return;
      }

      try {
        // Create and save user message
        const userMessage = await createMessageWithEmbedding(
          user.id,
          session.id,
          "user",
          content
        );

        setMessages((prev) => [...prev, userMessage]);

        // Start streaming the assistant's response
        setStreamingMessage({
          role: "assistant",
          content: "",
          isStreaming: true,
        });

        const formData = new FormData();
        formData.append("message", content);

        // Set knowledge piece updating state
        setIsUpdatingKnowledge(true);

        const response = await streamChatAction(null, formData, session.id);
        if (!response.success) {
          throw new Error(response.error || "Failed to get AI response");
        }

        let fullResponse = "";
        for (const chunk of response.chunks) {
          fullResponse += chunk;
          setStreamingMessage({
            role: "assistant",
            content: fullResponse,
            isStreaming: true,
          });
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const assistantMessage = await createMessageWithEmbedding(
          user.id,
          session.id,
          "assistant",
          fullResponse
        );

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingMessage(undefined);

        // Fetch updated knowledge piece
        const updatedKnowledgePiece = await getKnowledgePiece(session.id);
        setKnowledgePiece(updatedKnowledgePiece);
        setIsUpdatingKnowledge(false);
      } catch (err) {
        console.error("Error in chat:", err);
        setError(
          err instanceof Error ? err.message : "Failed to process message"
        );
        setStreamingMessage(undefined);
        setIsUpdatingKnowledge(false);
      }
    },
    [user, session]
  );

  // Load session data and knowledge piece
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !sessionId) {
        setLoading(false);
        setSession(null);
        setMessages([]);
        setStreamingMessage(undefined);
        setKnowledgePiece(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setMessages([]);
        setStreamingMessage(undefined);
        setKnowledgePiece(null);

        const [sessionData, existingMessages, currentKnowledgePiece] =
          await Promise.all([
            getSession(sessionId),
            getMessages(sessionId),
            getKnowledgePiece(sessionId),
          ]);

        if (!sessionData) throw new Error("Session not found");
        if (sessionData.user_id !== user.id) throw new Error("Unauthorized");

        setSession(sessionData);
        setMessages(existingMessages);
        setKnowledgePiece(currentKnowledgePiece);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session data"
        );
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, sessionId]);

  // Handle initial prompt from URL
  useEffect(() => {
    if (session && !initialPromptSentRef.current) {
      const prompt = searchParams.get("prompt");
      if (prompt) {
        handleSendMessage(prompt);
        initialPromptSentRef.current = true;
      }
    }
  }, [session, searchParams, handleSendMessage]);

  const handleDelete = async () => {
    if (!session) return;
    if (
      !confirm(
        "Are you sure you want to delete this session? This will delete all related resources and cannot be undone."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteResearchSession(session.id);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error ?? "Failed to delete session");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">Error</h3>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">
            Select a session from the sidebar
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Or create a new session to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <SessionHeader
        session={session}
        onDelete={handleDelete}
        isDeleting={isPending}
      />

      {/* Knowledge Piece */}
      <div className="px-6 py-4">
        <KnowledgePiece
          content={knowledgePiece || ""}
          isUpdating={isUpdatingKnowledge}
        />
      </div>

      {/* Chat Interface with fixed height */}
      <div className="flex-1 min-h-0 bg-dark-card shadow-card rounded-lg border border-dark-border mx-6 mb-6">
        <ChatInterface
          messages={messages}
          streamingMessage={streamingMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
