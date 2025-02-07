"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createSession } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function NewSession() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!user) throw new Error("Not authenticated");
      await createSession(user.id, title, description);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create session. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Create New Research Session
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Start a new research session by providing a title and description.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Title
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Enter a title for your research session"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              Description
            </label>
            <div className="mt-2">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                placeholder="Describe what you want to research..."
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
