"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Mail, Send, Shield, Heart } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  if (isLanding) {
    return (
      <footer className="border-t border-brand-sand/30 bg-brand-dark text-brand-beige overflow-hidden relative">
        {/* Soft background glow */}
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-gold/10 blur-[100px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-green/10 blur-[100px]" />
        
        {/* Decorative library lines */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-sand via-brand-gold to-brand-green" />

        <div className="mx-auto max-w-7xl px-6 py-16 relative z-10">
          <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
            {/* Logo / Brand Info */}
            <div className="space-y-4">
              <Link
                href="/"
                className="font-display flex items-center gap-2 text-2xl font-bold text-brand-cream"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cream/10 ring-1 ring-brand-cream/25">
                  <BookOpen className="h-4.5 w-4.5 text-brand-gold" />
                </span>
                BookVerse
              </Link>
              <p className="text-sm leading-relaxed text-brand-beige/70">
                A cozy digital sanctuary for book lovers. Read reviews, discover hidden gems, organize your library, and connect with fellow readers around the world.
              </p>
              <div className="flex gap-4 pt-2">
                <a
                  href="#"
                  className="p-2 rounded-full bg-brand-cream/5 text-brand-beige/60 transition hover:bg-brand-cream/10 hover:text-brand-cream flex items-center justify-center"
                  aria-label="Twitter"
                >
                  <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="p-2 rounded-full bg-brand-cream/5 text-brand-beige/60 transition hover:bg-brand-cream/10 hover:text-brand-cream flex items-center justify-center"
                  aria-label="Github"
                >
                  <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="p-2 rounded-full bg-brand-cream/5 text-brand-beige/60 transition hover:bg-brand-cream/10 hover:text-brand-cream"
                  aria-label="Goodreads"
                >
                  <BookOpen size={18} />
                </a>
              </div>
            </div>

            {/* Quick Navigation */}
            <div>
              <h3 className="font-display text-base font-bold text-brand-cream tracking-wide uppercase mb-5">
                Explore Library
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#quotes" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Cozy Quotes
                  </a>
                </li>
                <li>
                  <a href="#featured" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Featured Books
                  </a>
                </li>
                <li>
                  <a href="#categories" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Genres & Categories
                  </a>
                </li>
                <li>
                  <a href="#journey" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Reading Journey
                  </a>
                </li>
                <li>
                  <a href="#community" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Community Feed
                  </a>
                </li>
              </ul>
            </div>

            {/* Account & Meta */}
            <div>
              <h3 className="font-display text-base font-bold text-brand-cream tracking-wide uppercase mb-5">
                Join Us
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/login" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Create Account
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-brand-beige/70 hover:text-brand-cream transition">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-display text-base font-bold text-brand-cream tracking-wide uppercase mb-5">
                The Literary Circle
              </h3>
              <p className="text-sm text-brand-beige/70 mb-4 leading-relaxed">
                Subscribe to receive curated monthly reading logs, custom bookmarks, and book recommendations.
              </p>
              {subscribed ? (
                <div className="rounded-xl bg-brand-green/20 border border-brand-green/30 p-4 text-center">
                  <p className="text-sm font-semibold text-brand-cream flex items-center justify-center gap-1.5">
                    <Heart size={16} className="fill-brand-gold text-brand-gold animate-pulse" />
                    Welcome to the Circle!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/15 py-3 pl-4 pr-12 text-sm text-brand-cream outline-none transition placeholder:text-brand-beige/40 focus:border-brand-gold/50"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 p-2 rounded-lg bg-brand-gold text-brand-dark transition hover:bg-brand-gold/90 hover:scale-[1.03]"
                    aria-label="Subscribe"
                  >
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Decorative Book Spine Doodle at bottom */}
          <div className="mt-12 pt-8 border-t border-brand-cream/10 flex flex-col items-center justify-between gap-6 md:flex-row text-xs text-brand-beige/50">
            <p>© {new Date().getFullYear()} BookVerse. Made with love for readers worldwide.</p>
            
            {/* Mini visual shelf spine art in CSS */}
            <div className="flex gap-1 items-end h-8">
              <span className="w-1.5 h-6 bg-brand-gold/40 rounded-t" />
              <span className="w-2 h-7 bg-brand-green/40 rounded-t" />
              <span className="w-1.5 h-5 bg-brand-sand/40 rounded-t rotate-6 origin-bottom" />
              <span className="w-2 h-8 bg-brand-cream/30 rounded-t" />
            </div>

            <p className="flex items-center gap-1">
              <span>Built for bookworms</span>
              <Heart size={12} className="fill-brand-gold text-brand-gold" />
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Original layout for other pages
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
