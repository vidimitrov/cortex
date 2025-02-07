"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, firstName, lastName);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during sign up. Please try again."
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
            <h1 className="text-4xl font-bold text-white">
              Get Started with Cortex
            </h1>
            <p className="text-white/80">
              Complete these easy steps to register your account.
            </p>

            <div className="space-y-4 mt-12">
              <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-primary-600 font-semibold">
                  1
                </span>
                <span className="text-white">Sign up your account</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/60 font-semibold">
                  2
                </span>
                <span className="text-white/60">Set up your workspace</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/60 font-semibold">
                  3
                </span>
                <span className="text-white/60">Set up your profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right section with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Sign Up Account</h2>
            <p className="mt-2 text-gray-400">
              Enter your personal data to create your account.
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    placeholder="eg. John"
                    className="w-full px-4 py-3 bg-dark-card rounded-lg border border-dark-border focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    placeholder="eg. Francisco"
                    className="w-full px-4 py-3 bg-dark-card rounded-lg border border-dark-border focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-dark-card rounded-lg border border-dark-border focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Must be at least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 bg-dark-card rounded-lg border border-dark-border focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
                />
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
                Sign Up
              </button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary-400 hover:text-primary-300"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
