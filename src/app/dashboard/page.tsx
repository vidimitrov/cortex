"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Session } from "@/types";
import { getSessions } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      try {
        const data = await getSessions(user.id);
        setSessions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load sessions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen-without-nav flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">Error</h3>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-white">
              Research Sessions
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Your research sessions and knowledge pieces
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/dashboard/sessions/new"
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Session
            </Link>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="mt-16 text-center">
            <h3 className="text-lg font-medium text-white">
              No research sessions yet
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Get started by creating a new research session
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/sessions/new"
                className="btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Session
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden shadow-card rounded-lg border border-dark-border">
                  <table className="min-w-full divide-y divide-dark-border">
                    <thead className="bg-dark-card">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 lg:pl-8"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Created
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8"
                        >
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border bg-dark-bg">
                      {sessions.map((session) => (
                        <tr key={session.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6 lg:pl-8">
                            {session.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                            {session.description}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                            {new Date(session.created_at).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                            <Link
                              href={`/dashboard/sessions/${session.id}`}
                              className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
