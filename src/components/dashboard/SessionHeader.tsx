import React from "react";
import { Session } from "@/types";
import { TrashIcon } from "@heroicons/react/24/outline";

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
  return (
    <div className="bg-dark-surface border-b border-dark-border p-6 flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          {session.title}
        </h1>
        {session.description && (
          <p className="text-gray-400">{session.description}</p>
        )}
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        title="Delete session"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
