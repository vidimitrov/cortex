"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Session } from "@/types";
import { getSessions } from "@/lib/supabase";
import SessionSidebar from "@/components/dashboard/SessionSidebar";
import {
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getSessions(user.id);
        setSessions(data);

        // If we're on a session page, set it as active
        const match = pathname.match(/\/dashboard\/sessions\/([^/]+)$/);
        const sessionId = match ? match[1] : undefined;
        setActiveSessionId(sessionId);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, pathname]); // Re-fetch when pathname changes (including session changes)

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push(`/dashboard/sessions/${sessionId}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-75 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 flex w-64 flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col bg-dark-card border-r border-dark-border">
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Sessions Sidebar */}
            <SessionSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSessionSelect={handleSessionSelect}
            />
          </div>
          <div className="flex flex-shrink-0 border-t border-dark-border p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div>
                  <UserCircleIcon className="inline-block h-9 w-9 rounded-full text-gray-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-2 p-1 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-dark-card border-b border-dark-border lg:hidden">
        <button
          type="button"
          className="px-4 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 lg:hidden transition-colors duration-200"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64 min-h-screen bg-dark-bg">
        <main className="flex-1">
          <div className="py-6 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
