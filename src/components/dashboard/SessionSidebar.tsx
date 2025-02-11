import { Session } from "@/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import AnimatedSessionCard from "./AnimatedSessionCard";

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
}

export default function SessionSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
}: SessionSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2"
        >
          <img src="/logo.png" alt="Cortex Logo" className="w-6 h-6" />
          <span className="text-lg font-semibold text-white">CORTEX</span>
        </Link>
        <Link 
          href="/dashboard"
          className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-dark-hover rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
        </Link>
      </div>
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto mt-10">
        <div className="px-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {sessions.map((session) => (
              <AnimatedSessionCard
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => onSessionSelect(session.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
