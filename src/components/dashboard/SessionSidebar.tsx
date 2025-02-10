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
      {/* New Session Button */}
      <div className="p-4">
        <Link
          href="/dashboard/sessions/new"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Session
        </Link>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
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
