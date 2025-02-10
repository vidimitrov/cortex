import { useState, useRef, useEffect } from "react";
import { Message as MessageType, StreamingMessage } from "@/types";
import Message from "./Message";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface ChatInterfaceProps {
  messages: MessageType[];
  onSendMessage: (content: string) => void;
  streamingMessage?: StreamingMessage;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  streamingMessage,
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
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
