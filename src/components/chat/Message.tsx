import { MessageRole } from "@/types";
import { UserIcon } from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";

interface MessageProps {
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

export default function Message({
  role,
  content,
  isStreaming = false,
}: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-4 p-4 ${isUser ? "bg-dark-hover" : "bg-dark-card"}`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <BoltIcon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="text-sm text-gray-200">
          {content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
