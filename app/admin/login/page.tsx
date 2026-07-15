"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, BookOpen } from "lucide-react";
import { adminLoginAction } from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await adminLoginAction(formData);
        if (result.success) {
          toast({
            title: "Access Granted",
            description: "Welcome to the BookVerse control center.",
            type: "success",
          });
          router.push("/admin/dashboard");
          router.refresh();
        } else {
          setError(result.error || "Invalid username or password.");
          toast({
            title: "Authentication Failed",
            description: result.error || "Please verify your credentials.",
            type: "error",
          });
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white relative px-4">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] translate-x-1/2 translate-y-1/2 rounded-full bg-pink-600/10 blur-[130px]" />

      <div className="w-full max-w-md relative">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-400/30 mb-4 animate-pulse">
            <BookOpen className="h-6 w-6 text-indigo-400" />
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            BookVerse
          </h1>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1.5">
            Admin Console
          </p>
        </div>

        {/* Login form Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                  <User size={16} />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="admin"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Access Control"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-neutral-600 font-sans leading-relaxed">
          Authorized personnel only. Sessions are encrypted and logged.
        </p>
      </div>
    </div>
  );
}
