import React, { useState } from "react";
import { Session } from "@/types";
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { updateSessionTitle } from "@/app/actions/sessions";

interface SessionHeaderProps {
  session: Session;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}

export default function SessionHeader({
  session,
  onDelete,
  isDeleting,
}: SessionHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim() === session.title) {
      setIsEditing(false);
      setTitle(session.title);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateSessionTitle(session.id, title.trim());
      if (!result.success) {
        throw new Error(result.error);
      }
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update title");
      setTitle(session.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(session.title);
    setError(null);
  };

  return (
    <div className="bg-dark-surface border-b border-dark-border p-6 flex justify-between items-start">
      <div className="flex-1 mr-4">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-semibold text-white bg-dark-hover rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter title..."
                autoFocus
              />
              <button
                type="submit"
                disabled={isSaving}
                className="text-green-500 hover:text-green-400 disabled:opacity-50"
                title="Save title"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-300 disabled:opacity-50"
                title="Cancel editing"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-white">
              {session.title}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-300"
              title="Edit title"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        {session.description && (
          <p className="text-gray-400 mt-2">{session.description}</p>
        )}
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting || isEditing}
        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        title="Delete session"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
