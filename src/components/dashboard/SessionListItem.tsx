import { Session } from "@/types";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface SessionListItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
}

export default function SessionListItem({
  session,
  isActive,
  onClick,
}: SessionListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
        isActive
          ? "bg-primary-400/10 text-primary-400"
          : "text-gray-400 hover:bg-dark-hover hover:text-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <DocumentTextIcon
          className={`h-5 w-5 flex-shrink-0 ${
            isActive ? "text-primary-400" : "text-gray-400"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{session.title}</p>
          <p className="text-xs truncate mt-0.5 text-gray-500">
            {session.description || "No description"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {new Date(session.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </button>
  );
}
