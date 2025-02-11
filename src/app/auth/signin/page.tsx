"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-bg">
      {/* Left section with gradient */}
      <div className="hidden lg:block lg:w-1/2 relative bg-dark-bg">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.500)_0%,theme(colors.primary.600)_15%,theme(colors.primary.700)_35%,theme(colors.primary.800/30)_60%,transparent_80%)]"></div>
          <div className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg,#000_0deg_10deg,transparent_10deg_20deg)] opacity-[0.02] mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,theme(colors.dark.bg/70)_100%)]"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16">
          <div className="text-center max-w-md space-y-4">
            <div className="flex justify-center">
              <Image
                src="/logo-full.png"
                alt="Cortex Logo"
                width={180}
                height={40}
                className="mb-8"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-white">Cortex</h1>
            <p className="text-white/80">Sign in to continue to your account</p>
          </div>
        </div>
      </div>

      {/* Right section with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Sign In Account</h2>
            <p className="mt-2 text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <button className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-dark-border rounded-lg hover:bg-dark-card transition-colors">
              <Image src="/google.svg" alt="Google" width={20} height={20} />
              <span className="text-white">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-dark-border rounded-lg hover:bg-dark-card transition-colors">
              <Image src="/github.svg" alt="Github" width={20} height={20} />
              <span className="text-white">Github</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-bg text-gray-400">Or</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eg. johnfrans@gmail.com"
                  className="w-full px-4 py-3 bg-dark-card rounded-lg border border-dark-border focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-dark-card rounded-lg border border-dark-border focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Forgot password?
                </Link>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-dark-bg font-medium px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex justify-center items-center"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Sign In
              </button>

              <p className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary-400 hover:text-primary-300"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
