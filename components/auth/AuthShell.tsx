import { ReactNode } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  alternatePrompt: string;
  alternateHref: string;
  alternateLabel: string;
};

export default function AuthShell({
  children,
  title,
  subtitle,
  alternatePrompt,
  alternateHref,
  alternateLabel,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.05),transparent_55%)]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="font-display mb-10 inline-flex w-fit items-center gap-2 text-lg font-bold text-white transition hover:text-indigo-200"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30">
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </span>
          BookVerse
        </Link>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="hidden lg:block">
            <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
              Welcome back
            </p>
            <h1 className="font-display mt-4 text-5xl font-bold leading-tight">
              Your next great read is waiting.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-400">
              Track your reading, share honest reviews, and discover books loved
              by a community of passionate readers.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold">{title}</h2>
              <p className="mt-2 text-neutral-400">{subtitle}</p>
            </div>

            {children}

            <p className="mt-8 text-center text-sm text-neutral-400">
              {alternatePrompt}{" "}
              <Link
                href={alternateHref}
                className="font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                {alternateLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
