import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
        <Link
          href="/"
          className="font-display flex items-center gap-2 text-lg font-bold text-white"
        >
          <BookOpen className="h-5 w-5 text-indigo-400" />
          BookVerse
        </Link>
        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} BookVerse. Built for readers, by readers.
        </p>
        <div className="flex gap-6 text-sm text-neutral-400">
          <Link href="/login" className="transition hover:text-white">
            Log in
          </Link>
          <Link href="/signup" className="transition hover:text-white">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
