"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Session, Message, StreamingMessage } from "@/types";
import { getSession, getMessages } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useSearchParams } from "next/navigation";
import { deleteResearchSession } from "@/app/actions/sessions";
import { createMessageWithEmbedding } from "@/app/actions/embeddings";
import { streamChatAction } from "@/app/actions/chat";
import ChatInterface from "@/components/chat/ChatInterface";
import SessionHeader from "@/components/dashboard/SessionHeader";

export default function Dashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track if initial prompt has been sent
  const initialPromptSent = useRef(false);

  // Separate effect for loading session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !sessionId) {
        setLoading(false);
        return;
      }

      try {
        const sessionData = await getSession(sessionId);
        if (!sessionData) throw new Error("Session not found");
        if (sessionData.user_id !== user.id) throw new Error("Unauthorized");

        const existingMessages = await getMessages(sessionId);
        setSession(sessionData);
        setMessages(existingMessages);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session data");
        setLoading(false);
      }
    };

    setLoading(true);
    fetchSessionData();
  }, [user, sessionId]);

  // Separate effect for handling initial prompt
  useEffect(() => {
    const handleInitialPrompt = async () => {
      if (!session || !user || initialPromptSent.current || messages.length > 0 || loading) {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const prompt = urlParams.get('prompt');
      if (!prompt) return;

      try {
        initialPromptSent.current = true;
        // Remove prompt from URL
        window.history.replaceState({}, "", `/dashboard?session=${sessionId}`);
        // Send the initial prompt
        const decodedPrompt = decodeURIComponent(prompt);
        await handleSendMessage(decodedPrompt);
      } catch (err) {
        console.error("Error sending initial prompt:", err);
        setError("Failed to start conversation. Please try refreshing the page.");
      }
    };

    handleInitialPrompt();
  }, [session, user, messages.length, sessionId]);

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
        // Clear the session from URL and state
        window.history.pushState({}, "", "/dashboard");
        setSession(null);
        setMessages([]);
      } else {
        setError(result.error ?? "Failed to delete session");
      }
    });
  };

  const handleSendMessage = async (content: string) => {
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
    } catch (err) {
      console.error("Error in chat:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process message"
      );
      setStreamingMessage(undefined);
    }
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
      <div className="flex-1 bg-dark-card shadow-card rounded-lg border border-dark-border">
        <ChatInterface
          messages={messages}
          streamingMessage={streamingMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
