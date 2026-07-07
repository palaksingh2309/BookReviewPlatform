"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#trending", label: "Trending" },
  { href: "#community", label: "Community" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white transition hover:text-indigo-200"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-400/30">
            <BookOpen className="h-5 w-5 text-indigo-400" />
          </span>
          BookVerse
        </Link>

        {isLanding && (
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-display text-sm font-medium text-neutral-300 transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="font-display rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-white/5 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="font-display rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/10 transition hover:scale-[1.02] hover:bg-neutral-100"
          >
            Sign up
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-neutral-300 transition hover:bg-white/5 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-neutral-950/95 px-6 py-5 md:hidden">
          {isLanding && (
            <nav className="mb-5 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-display text-base font-medium text-neutral-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="font-display rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="font-display rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-950"
              onClick={() => setMobileOpen(false)}
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
