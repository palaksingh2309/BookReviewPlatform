"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, X, Coffee } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "#quotes", label: "Quotes" },
  { href: "#featured", label: "Featured" },
  { href: "#categories", label: "Categories" },
  { href: "#journey", label: "Journey" },
  { href: "#community", label: "Community" },
  { href: "#features", label: "Features" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLanding) {
    return (
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-brand-sand/30 bg-brand-cream/80 backdrop-blur-xl shadow-sm py-4"
            : "border-b border-transparent bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display flex items-center gap-2.5 text-2xl font-bold tracking-tight text-brand-brown transition hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-brown/5 ring-1 ring-brand-brown/15 shadow-sm">
              <BookOpen className="h-5 w-5 text-brand-brown" />
            </span>
            <span className="font-display font-black text-brand-brown">BookVerse</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-sans text-sm font-medium text-brand-brown/70 transition-colors duration-200 hover:text-brand-brown"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="font-sans text-sm font-semibold text-brand-brown/80 rounded-full px-5 py-2.5 transition duration-200 hover:bg-brand-brown/5 hover:text-brand-brown"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="font-sans text-sm font-semibold bg-brand-brown text-brand-cream rounded-full px-5 py-2.5 shadow-md shadow-brand-brown/10 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-brown/90 hover:shadow-lg hover:shadow-brand-brown/20"
            >
              Sign up
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-brand-brown/80 transition hover:bg-brand-brown/5 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-b border-brand-sand/30 bg-brand-cream/95 backdrop-blur-xl px-6 py-5 md:hidden shadow-lg animate-in slide-in-from-top-4 duration-200">
            <nav className="mb-5 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-sans text-base font-medium text-brand-brown/70 hover:text-brand-brown"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="font-sans rounded-xl border border-brand-sand/40 px-4 py-3 text-center text-sm font-semibold text-brand-brown"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="font-sans rounded-xl bg-brand-brown px-4 py-3 text-center text-sm font-semibold text-brand-cream shadow-md shadow-brand-brown/10"
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

  // Preserve original layout/theme for other pages
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
