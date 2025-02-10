"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Session, Message, StreamingMessage } from "@/types";
import { getSession, getMessages, getSessions } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteResearchSession } from "@/app/actions/sessions";
import { createMessageWithEmbedding } from "@/app/actions/embeddings";
import { streamChatAction } from "@/app/actions/chat";
import ChatInterface from "@/components/chat/ChatInterface";
import SessionHeader from "@/components/dashboard/SessionHeader";
import SessionListItem from "@/components/dashboard/SessionListItem";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user } = useAuth();
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

  // Load all sessions
  useEffect(() => {
    const fetchAllSessions = async () => {
      if (!user) return;
      try {
        const data = await getSessions(user.id);
        setSessions(data);
      } catch (err) {
        console.error("Error fetching all sessions:", err);
      }
    };
    fetchAllSessions();
  }, [user]);

  // Separate effect for loading session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !sessionId) {
        setLoading(false);
        setSession(null);
        setMessages([]);
        setStreamingMessage(undefined);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setMessages([]);
        setStreamingMessage(undefined);
        
        const sessionData = await getSession(sessionId);
        if (!sessionData) throw new Error("Session not found");
        if (sessionData.user_id !== user.id) throw new Error("Unauthorized");

        const existingMessages = await getMessages(sessionId);
        setSession(sessionData);
        setMessages(existingMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session data");
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
    // Reset initialPromptSent when session changes
    initialPromptSent.current = false;
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
        router.replace(`/dashboard?session=${sessionId}`);
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
        // Clear the session using router
        router.push("/dashboard");
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
      <div className="min-h-screen-without-nav flex flex-col justify-center gap-8 px-4">
        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="w-full max-w-3xl mx-auto">
            <h3 className="text-lg font-medium text-white mb-4">
              Recent Sessions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 3)
                .map((recentSession) => (
                  <div
                    key={recentSession.id}
                    className="bg-dark-card border border-dark-border rounded-lg overflow-hidden hover:border-primary-400/50 transition-colors duration-200"
                    onClick={() => router.push(`/dashboard?session=${recentSession.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <SessionListItem
                      session={recentSession}
                      isActive={false}
                      onClick={() => router.push(`/dashboard?session=${recentSession.id}`)}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* New Session CTA */}
        <div className="w-full max-w-3xl mx-auto">
          <Link
            href="/dashboard/sessions/new"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <PlusIcon className="h-5 w-5" />
            New Session
          </Link>
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
