"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Session } from "@/types";
import { getSessions } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { createSessionFromMessage } from "@/app/actions/sessions";
import ChatInterface from "@/components/chat/ChatInterface";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSessions(user.id);
        setSessions(data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [authLoading, user, router]);

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

      // Wait for a moment to ensure the session is created in the database
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to the new session with the generated research prompt
      router.push(
        `/dashboard/sessions/${result.session.id}?prompt=${encodeURIComponent(
          result.prompt
        )}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen-without-nav flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl space-y-4">
          <h1 className="text-2xl font-semibold text-white text-center">
            What can I help with?
          </h1>
          <ChatInterface
            messages={[]}
            onSendMessage={handleNewMessage}
            recentSessions={sessions.slice(0, 5)}
            onSessionSelect={(id) => router.push(`/dashboard/sessions/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
