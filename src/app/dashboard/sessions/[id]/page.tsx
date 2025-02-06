"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSession, getKnowledgePieces } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  DocumentTextIcon,
  LinkIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Session, KnowledgePiece } from "@/types";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [knowledgePieces, setKnowledgePieces] = useState<KnowledgePiece[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !params.id) return;

      try {
        const sessionData = await getSession(params.id as string);
        if (!sessionData) throw new Error("Session not found");
        if (sessionData.user_id !== user.id) throw new Error("Unauthorized");

        setSession(sessionData);

        const pieces = await getKnowledgePieces(params.id as string);
        setKnowledgePieces(pieces);
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
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
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
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {session.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{session.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Context Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Context</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add resources to help with your research
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <button className="btn-secondary w-full flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Add Text
                  </button>
                  <button className="btn-secondary w-full flex items-center justify-center">
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Add URL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Pieces Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Knowledge Pieces
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      AI-generated summaries and insights
                    </p>
                  </div>
                  <button className="btn-primary flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Generate New
                  </button>
                </div>
              </div>
              <div className="p-4">
                {knowledgePieces.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">
                      No knowledge pieces yet. Add some context and generate
                      your first piece.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgePieces.map((piece) => (
                      <div
                        key={piece.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: piece.structured_output,
                          }}
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          Generated on{" "}
                          {new Date(piece.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
