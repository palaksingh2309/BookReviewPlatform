"use client";

import Link from "next/link";
import {
  BookMarked,
  BookOpen,
  ChevronRight,
  MessageCircle,
  Quote,
  TrendingUp,
  Users,
} from "lucide-react";

import Footer from "../components/Footer";
import Hero from "../components/landing/Hero";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: BookOpen,
    title: "Discover Books",
    desc: "Browse curated lists, trending titles, and personalized recommendations tailored to your taste.",
  },
  {
    icon: MessageCircle,
    title: "Write Reviews",
    desc: "Share thoughtful reviews that help others find their next favorite read.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    desc: "Set reading goals, log finished books, and celebrate milestones along the way.",
  },
  {
    icon: Users,
    title: "Join the Community",
    desc: "Follow readers, discuss stories, and build your literary circle.",
  },
];

const testimonials = [
  {
    quote:
      "BookVerse turned my scattered notes into a beautiful reading journal. I love seeing my progress grow.",
    name: "Priya Sharma",
    role: "Avid fiction reader",
  },
  {
    quote:
      "The reviews feel genuine and the community is welcoming. I discover a new favorite book every week.",
    name: "Marcus Chen",
    role: "Book club organizer",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-5%] h-[32rem] w-[32rem] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[32rem] w-[32rem] rounded-full bg-pink-600/15 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.04),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,10,10,0.8))]" />
      </div>

      <Navbar />

      <main>
        <Hero />

        <section id="features" className="scroll-mt-28 border-y border-white/10 bg-white/[0.02] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
                Features
              </p>
              <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                Everything a reader needs
              </h2>
              <p className="mt-5 text-lg text-neutral-400">
                Beautiful tools designed for discovering, reviewing, and sharing
                your reading experience.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.07]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                      <Icon className="text-indigo-300" size={22} />
                    </div>
                    <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-neutral-400">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="community" className="scroll-mt-28 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
                >
                  <Quote className="text-indigo-400" size={28} />
                  <p className="mt-6 text-lg leading-8 text-neutral-300">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-neutral-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-pink-600/20 px-8 py-16 text-center sm:px-16">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.12),transparent_55%)]" />
              <div className="relative">
                <BookMarked className="mx-auto text-indigo-200" size={36} />
                <h2 className="font-display mt-6 text-4xl font-bold sm:text-5xl">
                  Start your reading journey today
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-200/80">
                  Create a free account in seconds and join a community of readers
                  who love discovering and discussing great books.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-neutral-950 transition hover:bg-neutral-100"
                  >
                    Create free account
                    <ChevronRight size={18} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-full border border-white/20 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
                  >
                    I already have an account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
