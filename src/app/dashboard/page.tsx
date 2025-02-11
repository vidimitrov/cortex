"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Session, Message, StreamingMessage } from "@/types";
import { getSession, getMessages, getSessions } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteResearchSession, createSessionFromMessage } from "@/app/actions/sessions";
import { createMessageWithEmbedding } from "@/app/actions/embeddings";
import { streamChatAction } from "@/app/actions/chat";
import ChatInterface from "@/components/chat/ChatInterface";
import SessionHeader from "@/components/dashboard/SessionHeader";
import Modal from "@/components/ui/Modal";
import { AnimatePresence } from "framer-motion";
import AnimatedSessionCard from "@/components/dashboard/AnimatedSessionCard";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track if initial prompt has been sent
  const initialPromptSent = useRef(false);

  // Combined effect for loading data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Always fetch sessions
        const sessionsData = await getSessions(user.id);
        setSessions(sessionsData);

        // If there's a session ID, fetch that session's data
        if (sessionId) {
          const sessionData = await getSession(sessionId);
          if (!sessionData) throw new Error("Session not found");
          if (sessionData.user_id !== user.id) throw new Error("Unauthorized");

          const existingMessages = await getMessages(sessionId);
          setSession(sessionData);
          setMessages(existingMessages);
        } else {
          setSession(null);
          setMessages([]);
        }

        setStreamingMessage(undefined);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load data"
        );
        setSession(null);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Reset initialPromptSent when session changes
    initialPromptSent.current = false;
  }, [user, sessionId]);

  // Separate effect for handling initial prompt
  useEffect(() => {
    const handleInitialPrompt = async () => {
      if (
        !session ||
        !user ||
        initialPromptSent.current ||
        messages.length > 0 ||
        loading
      ) {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const prompt = urlParams.get("prompt");
      if (!prompt) return;

      try {
        initialPromptSent.current = true;
        // Remove prompt from URL
        router.replace(`/dashboard?session=${sessionId}`);
        // Send the initial prompt
        const decodedPrompt = decodeURIComponent(prompt);
        await handleSendMessage(decodedPrompt);
      } catch (err) {
        console.error("Error sending initial prompt:", err);
        setError(
          "Failed to start conversation. Please try refreshing the page."
        );
      }
    };

    handleInitialPrompt();
  }, [session, user, messages.length, sessionId]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (!session) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!session) return;
    startTransition(async () => {
      setShowDeleteModal(false);
      const result = await deleteResearchSession(session.id);
      if (result.success) {
        // Update sessions list immediately to trigger animation
        setSessions((prevSessions) =>
          prevSessions.filter((s) => s.id !== session.id)
        );
        // Clear the current session immediately to show the dashboard view
        setSession(null);
        // Replace URL without waiting for animation since we're already showing the dashboard
        router.replace("/dashboard", { scroll: false });
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
        err instanceof Error ? err.message : "Failed to process message"
      );
      setStreamingMessage(undefined);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [authLoading, user, router]);

  if (authLoading || loading) {
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
            onClick={async () => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleNewMessage = async (content: string) => {
    if (!user) {
      setError("Please sign in to continue");
      return;
    }

    try {
      // Create a new session from the message
      const result = await createSessionFromMessage(user.id, content);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Redirect to the new session
      router.push(`/dashboard?session=${result.session.id}&prompt=${encodeURIComponent(content)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen-without-nav flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-semibold text-white mb-8">
            What can I help with?
          </h1>
          <div className="w-full max-w-3xl">
            <ChatInterface
              messages={[]}
              onSendMessage={handleNewMessage}
              recentSessions={sessions.slice(0, 5)}
              onSessionSelect={(id) => router.push(`/dashboard?session=${id}`)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <Modal
        isOpen={showDeleteModal}
        onClose={async () => setShowDeleteModal(false)}
        title="Delete Session"
        description="Are you sure you want to delete this session? This will delete all related resources and cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isDestructive={true}
        isProcessing={isPending}
      />
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
