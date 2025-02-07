"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSession, getMessages } from "@/lib/supabase";
import { createMessageWithEmbedding } from "@/app/actions/embeddings";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Session, Message, StreamingMessage } from "@/types";
import ChatInterface from "@/components/chat/ChatInterface";
import { streamChatAction } from "@/app/actions/chat";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<
    StreamingMessage | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!user || !session) {
        setError("User not authenticated");
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

        // Create form data for the server action
        const formData = new FormData();
        formData.append("message", content);

        // Call server action and handle response
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
          // Add a small delay to simulate streaming
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Save the complete assistant message
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
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null
            ? JSON.stringify(err)
            : "Failed to process message";
        setError(errorMessage);
      }
    },
    [user, session, setMessages, setStreamingMessage, setError]
  );

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !params.id) return;

      try {
        const sessionData = await getSession(params.id as string);
        if (!sessionData) throw new Error("Session not found");
        if (sessionData.user_id !== user.id) throw new Error("Unauthorized");

        setSession(sessionData);

        const existingMessages = await getMessages(params.id as string);
        setMessages(existingMessages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [user, params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">Error</h3>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {session.title}
            </h1>
            <p className="mt-1 text-sm text-gray-400">{session.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Context Panel */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card shadow-card rounded-lg border border-dark-border">
              <div className="px-4 py-5 border-b border-dark-border sm:px-6">
                <h2 className="text-lg font-medium text-white">Context</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Coming soon: Add resources to help with your research
                </p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-dark-card shadow-card rounded-lg border border-dark-border h-[600px]">
              <ChatInterface
                messages={messages}
                streamingMessage={streamingMessage}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
