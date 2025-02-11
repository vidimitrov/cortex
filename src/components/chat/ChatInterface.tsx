import { useState, useRef, useEffect } from "react";
import { Message as MessageType, StreamingMessage, Session } from "@/types";
import Message from "./Message";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface ChatInterfaceProps {
  messages: MessageType[];
  onSendMessage: (content: string) => void;
  streamingMessage?: StreamingMessage;
  recentSessions?: Session[];
  onSessionSelect?: (sessionId: string) => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  streamingMessage,
  recentSessions = [],
  onSessionSelect,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-px">
          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}
          {streamingMessage && (
            <Message
              role={streamingMessage.role}
              content={streamingMessage.content}
              isStreaming={streamingMessage.isStreaming}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-dark-border p-4">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-dark-hover text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>

        {/* Recent Sessions */}
        {recentSessions && recentSessions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-400 mb-2">Recent sessions</h3>
            <div className="flex flex-wrap gap-2">
              {recentSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSessionSelect?.(session.id)}
                  className="px-4 py-2 text-sm bg-dark-hover text-gray-300 rounded-lg hover:bg-dark-active transition-colors truncate max-w-[200px]"
                >
                  {session.title || 'Untitled Session'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
