"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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

  const navigation = [
    {
      name: "Research Sessions",
      href: "/dashboard",
      icon: DocumentTextIcon,
      current: pathname === "/dashboard",
    },
    {
      name: "New Session",
      href: "/dashboard/sessions/new",
      icon: PlusIcon,
      current: pathname === "/dashboard/sessions/new",
    },
  ];

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
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4 gap-2">
              <Image src="/logo.png" alt="Cortex Logo" width={32} height={32} />
              <h1 className="text-2xl font-bold text-white">Cortex</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? "bg-primary-400/10 text-primary-400"
                      : "text-gray-400 hover:bg-dark-hover hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      item.current
                        ? "text-primary-400"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-dark-border p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div>
                  <UserCircleIcon className="inline-block h-9 w-9 rounded-full text-gray-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white">
                    {user?.email}
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
