"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<
    StreamingMessage | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const initialMessageSent = useRef(false);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Store current session and user values to prevent closure issues
      const currentUser = user;
      const currentSession = session;

      if (!currentUser || !currentSession) {
        setError("User not authenticated");
        return;
      }

      // Clear any previous errors
      setError("");

      try {
        // Create and save user message
        const userMessage = await createMessageWithEmbedding(
          currentUser.id,
          currentSession.id,
          "user",
          content
        );

        // Update messages atomically
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
        const response = await streamChatAction(
          null,
          formData,
          currentSession.id
        );
        if (!response.success) {
          throw new Error(response.error || "Failed to get AI response");
        }

        // Build response and update streaming state
        let fullResponse = "";
        for (const chunk of response.chunks) {
          // Check if component is still mounted and session is still valid
          if (!currentSession) return;

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
          currentUser.id,
          currentSession.id,
          "assistant",
          fullResponse
        );

        // Update messages atomically one final time
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
        setStreamingMessage(undefined);
      }
    },
    [user, session] // Only depend on user and session
  );

  // Effect for loading session data
  useEffect(() => {
    let isMounted = true;

    const fetchSessionData = async () => {
      if (!user || !params.id) {
        if (isMounted) setIsLoading(true);
        return;
      }

      try {
        const sessionData = await getSession(params.id as string);
        if (!sessionData) throw new Error("Session not found");
        if (sessionData.user_id !== user.id) throw new Error("Unauthorized");

        const existingMessages = await getMessages(params.id as string);

        if (isMounted) {
          setSession(sessionData);
          setMessages(existingMessages);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load session data"
          );
          setIsLoading(false);
        }
      }
    };

    fetchSessionData();
    return () => {
      isMounted = false;
    };
  }, [user, params.id]); // Only depend on user and params.id

  // Separate effect for handling the initial prompt
  useEffect(() => {
    if (!session || !user || initialMessageSent.current) return;

    const prompt = searchParams.get("prompt");
    if (!prompt) return;

    // Mark as sent immediately
    initialMessageSent.current = true;

    // Remove the prompt from the URL without refreshing the page
    const newUrl = window.location.pathname;
    window.history.replaceState({}, "", newUrl);

    // Decode and send the prompt
    const decodedPrompt = decodeURIComponent(prompt);
    handleSendMessage(decodedPrompt);
  }, [session, user, searchParams, handleSendMessage]);

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

        <div className="bg-dark-card shadow-card rounded-lg border border-dark-border h-[600px]">
          <ChatInterface
            messages={messages}
            streamingMessage={streamingMessage}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
