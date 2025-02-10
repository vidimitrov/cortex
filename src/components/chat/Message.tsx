import { MessageRole } from "@/types";
import { UserIcon } from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        <div className="text-sm text-gray-200 markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              code: ({ inline, className, children, ...props }: any) =>
                inline ? (
                  <code className="bg-gray-800 rounded px-1 py-0.5" {...props}>
                    {children}
                  </code>
                ) : (
                  <code
                    className="block bg-gray-800 rounded p-3 my-2 overflow-x-auto"
                    {...props}
                  >
                    {children}
                  </code>
                ),
              h1: ({ children }) => (
                <h1 className="text-xl font-semibold mb-4 mt-6">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mb-3 mt-5">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mb-2 mt-4">
                  {children}
                </h3>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-600 pl-4 my-4 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
