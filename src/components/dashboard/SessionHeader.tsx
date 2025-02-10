import { Session } from "@/types";
import { TrashIcon } from "@heroicons/react/24/outline";

interface SessionHeaderProps {
  session: Session;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function SessionHeader({
  session,
  onDelete,
  isDeleting = false,
}: SessionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
      <div>
        <h1 className="text-xl font-semibold text-white">{session.title}</h1>
        {session.description && (
          <p className="mt-1 text-sm text-gray-400">{session.description}</p>
        )}
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="p-2 text-red-500 hover:text-red-400 transition-colors duration-200 disabled:opacity-50"
        title="Delete session"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
