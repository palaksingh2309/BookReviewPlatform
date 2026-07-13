"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  Star,
  Bookmark,
  Users,
  Compass,
  Award,
  Heart,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Coffee,
  Search,
  CheckCircle,
  Plus,
  Sparkles
} from "lucide-react";

import Footer from "../components/Footer";
import Hero from "../components/landing/Hero";
import Navbar from "../components/Navbar";

// --- Types ---
interface Book {
  title: string;
  author: string;
  rating: number;
  genre: string;
  coverColor: string;
  quote: string;
  spineColor: string;
  desc: string;
}

// --- Hardcoded Beautiful Data ---
const quotes = [
  { text: "A reader lives a thousand lives before he dies.", author: "George R.R. Martin" },
  { text: "Books are uniquely portable magic.", author: "Stephen King" },
  { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" }
];

const featuredBooks: Book[] = [
  {
    title: "The Shadow of the Wind",
    author: "Carlos Ruiz Zafón",
    rating: 4.8,
    genre: "Mystery",
    coverColor: "from-amber-800 to-amber-950",
    spineColor: "bg-amber-900",
    quote: "Every book, every volume you see here, has a soul.",
    desc: "In the heart of Barcelona, a young boy finds a mysterious book in the Cemetery of Forgotten Books."
  },
  {
    title: "The Starless Sea",
    author: "Erin Morgenstern",
    rating: 4.7,
    genre: "Fantasy",
    coverColor: "from-indigo-850 to-indigo-950",
    spineColor: "bg-indigo-900",
    quote: "A harbor on a starless sea, a place for stories to stay.",
    desc: "A graduate student finds a mysterious book in his university library containing pages about his own childhood."
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    rating: 4.6,
    genre: "Fiction",
    coverColor: "from-emerald-800 to-emerald-950",
    spineColor: "bg-emerald-900",
    quote: "Autumn leaves don't fall, they fly. They take their time.",
    desc: "A lonely marsh girl becomes a suspect in the murder of a former local star quarterback."
  },
  {
    title: "Educated",
    author: "Tara Westover",
    rating: 4.9,
    genre: "Biography",
    coverColor: "from-rose-800 to-rose-950",
    spineColor: "bg-rose-900",
    quote: "I had defined myself, and now I had to defend that definition.",
    desc: "An unforgettable memoir about a young girl who leaves her survivalist family to earn a PhD from Cambridge."
  }
];

const categories = [
  { name: "Fiction", icon: "📖", color: "from-amber-100 to-orange-100", border: "border-amber-200" },
  { name: "Fantasy", icon: "✨", color: "from-purple-100 to-indigo-100", border: "border-purple-200" },
  { name: "Mystery", icon: "🔍", color: "from-sky-100 to-blue-100", border: "border-sky-200" },
  { name: "Romance", icon: "💖", color: "from-rose-100 to-pink-100", border: "border-rose-200" },
  { name: "Thriller", icon: "⚡", color: "from-red-100 to-amber-100", border: "border-red-200" },
  { name: "Science Fiction", icon: "🚀", color: "from-blue-100 to-teal-100", border: "border-blue-200" },
  { name: "Biography", icon: "✍️", color: "from-orange-100 to-yellow-100", border: "border-orange-200" },
  { name: "Self Help", icon: "🌱", color: "from-emerald-100 to-green-100", border: "border-emerald-200" },
  { name: "History", icon: "⏳", color: "from-stone-100 to-sand-100", border: "border-stone-200" },
  { name: "Poetry", icon: "✒️", color: "from-violet-100 to-fuchsia-100", border: "border-violet-200" },
  { name: "Classics", icon: "🏛️", color: "from-yellow-100 to-amber-100", border: "border-yellow-200" },
  { name: "Horror", icon: "🕯️", color: "from-neutral-100 to-zinc-200", border: "border-neutral-300" }
];

const timelineSteps = [
  { number: "01", icon: BookOpen, title: "Discover", desc: "Explore thousands of books with custom reviews, curated tags, and filters." },
  { number: "02", icon: Heart, title: "Save", desc: "Build your personalized bookshelf, organize wishlists, and set aside books for later." },
  { number: "03", icon: Star, title: "Review", desc: "Write detailed critiques, rate books on aesthetics, and log your thoughts." },
  { number: "04", icon: MessageSquare, title: "Discuss", desc: "Engage with like-minded bookworms in comments, share quotes, and debate endings." },
  { number: "05", icon: Flame, title: "Track Progress", desc: "Keep reading streaks alive, map out pages, and celebrate annual goals." }
];

const features = [
  { icon: BookOpen, title: "Discover Millions of Books", desc: "Browse a expansive archive of titles, genres, and community logs." },
  { icon: Compass, title: "Personalized Recommendations", desc: "A cozy recommendation feed that learns your reading flavor profile." },
  { icon: Heart, title: "Wishlist Management", desc: "Organize books into custom boards, read-next slots, and finished piles." },
  { icon: Flame, title: "Reading Tracker", desc: "Record daily read pages, track books read over the year, and stay motivated." },
  { icon: Star, title: "Reviews & Ratings", desc: "Share rich ratings, formatting quotes, and deep review analyses." },
  { icon: Users, title: "Book Clubs", desc: "Create private groups, host weekly chats, and share virtual reading lounges." },
  { icon: TrendingUp, title: "Reading Streaks", desc: "Stay motivated with daily counters, streaks, and calendar check-ins." },
  { icon: Award, title: "Achievement Badges", desc: "Earn decorative badges for finishing challenging series and reading streaks." },
  { icon: MessageSquare, title: "Quote Sharing", desc: "Extract quote graphics, add parchment card filters, and export to social." },
  { icon: Sparkles, title: "AI Recommendations", desc: "Interact with our AI librarian to discover books tailored to your mood." }
];

// --- Subcomponents ---

// High Performance Viewport Counter
function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Extract number and suffix
  const numValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    let observer: IntersectionObserver;
    let startTimestamp: number | null = null;
    const duration = 2; // seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo function
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * numValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        window.requestAnimationFrame(step);
        if (elementRef.current) observer.unobserve(elementRef.current);
      }
    };

    observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [numValue]);

  return (
    <div ref={elementRef} className="text-center p-6 bg-brand-cream/40 rounded-2xl border border-brand-sand/20 shadow-sm backdrop-blur-md">
      <p className="font-display text-4xl sm:text-5xl font-black text-brand-brown tracking-tight">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-sm sm:text-base font-medium text-brand-brown/70 tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}

// Drifting Background Particles
function BackgroundParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Drifting Leaves */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          initial={{
            opacity: 0,
            x: Math.random() * 100 + "%",
            y: "-10%"
          }}
          animate={{
            opacity: [0, 0.4, 0.4, 0],
            y: ["0%", "110%"],
            x: ["0%", `${(Math.random() - 0.5) * 200}px`],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
          }}
          transition={{
            duration: 15 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 10
          }}
          className="absolute text-brand-green/10"
          style={{ fontSize: 16 + Math.random() * 16 }}
        >
          🍂
        </motion.div>
      ))}

      {/* Blinking warm lights */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`light-${i}`}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3
          }}
          className="absolute rounded-full bg-brand-gold/15 blur-[2px]"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%"
          }}
        />
      ))}

      {/* Tiny floating stars */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 45, 0]
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
          className="absolute text-brand-gold/20 font-serif"
          style={{
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            fontSize: 10 + Math.random() * 8
          }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  );
}

// --- Main Page Component ---
export default function Page() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper-texture text-brand-brown font-sans relative selection:bg-brand-gold/30">
      
      {/* Canvas Layer */}
      <BackgroundParticles />

      {/* Sticky Header Nav */}
      <Navbar />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <Hero />

        {/* BOOK QUOTES SECTION */}
        <section id="quotes" className="scroll-mt-20 py-24 border-b border-brand-sand/15 relative overflow-hidden bg-brand-beige/25">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">Inspiration</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-brown">
                Words from the Wise
              </h2>
              <div className="w-12 h-1 bg-brand-gold/60 mx-auto rounded" />
            </div>

            {/* Quote Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quotes.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-brand-sand/30 bg-brand-cream p-8 shadow-sm transition-all duration-300 hover:shadow-brown-glow hover:scale-[1.01]"
                >
                  {/* Decorative quote mark */}
                  <span className="absolute top-4 right-6 text-7xl font-serif text-brand-sand/20 leading-none pointer-events-none">“</span>
                  
                  <p className="font-display italic text-lg sm:text-xl text-brand-brown leading-relaxed relative z-10">
                    "{q.text}"
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-brand-sand/20 flex items-center gap-2">
                    <span className="w-3 h-[1px] bg-brand-gold" />
                    <p className="text-xs font-bold text-brand-brown/70 uppercase tracking-widest">
                      {q.author}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED BOOKS SECTION */}
        <section id="featured" className="scroll-mt-20 py-24 border-b border-brand-sand/15 bg-brand-cream/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-green">Curator's Choice</span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-brown">
                  Featured Books
                </h2>
                <p className="text-sm text-brand-brown/65">Hover over a book to swing open the cover and read reviews.</p>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 font-bold text-sm text-brand-brown hover:text-brand-gold transition group self-start"
              >
                View Library Archive
                <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Grid of Books */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBooks.map((book, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="book-flip-container relative w-full h-[360px] cursor-pointer"
                >
                  {/* Inside Page (Revealed under cover) */}
                  <div className="book-flip-page absolute inset-0 bg-brand-cream border border-brand-sand/40 rounded-r-2xl shadow-inner p-6 flex flex-col justify-between select-none">
                    <div className="space-y-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-brand-brown/70 bg-brand-beige border border-brand-sand/30 rounded-full uppercase tracking-wider">
                        {book.genre}
                      </span>
                      <p className="font-display italic text-sm text-brand-brown/85 leading-relaxed pt-2">
                        "{book.quote}"
                      </p>
                      <p className="text-xs leading-relaxed text-brand-brown/65">
                        {book.desc}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-brand-gold">
                        <div className="flex text-brand-gold">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star key={sIdx} size={11} fill={sIdx < Math.floor(book.rating) ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span className="font-bold text-brand-brown/80">{book.rating} / 5</span>
                      </div>
                      <Link
                        href="/signup"
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-brown py-2.5 text-xs font-semibold text-brand-cream hover:bg-brand-brown/90 shadow-sm"
                      >
                        Read Reviews
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Book Cover (Rotates open on left border) */}
                  <div className={`book-flip-cover absolute inset-0 rounded-r-2xl overflow-hidden shadow-md flex flex-col justify-between p-6 bg-gradient-to-br ${book.coverColor} text-brand-cream border-l-8 border-brand-gold`}>
                    
                    {/* Cover Header */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-brand-gold/90">{book.genre}</span>
                        <BookOpen size={13} className="text-brand-cream/30" />
                      </div>
                      <h3 className="font-display font-bold text-lg sm:text-xl leading-tight pt-2 drop-shadow text-brand-cream">{book.title}</h3>
                    </div>

                    {/* Cover Spine Footer */}
                    <div className="space-y-2 border-t border-brand-cream/15 pt-4">
                      <p className="text-xs text-brand-beige/85">by {book.author}</p>
                      <div className="flex justify-between items-center text-[10px] text-brand-gold font-serif">
                        <span>★ {book.rating}</span>
                        <span className="opacity-40">BookVerse</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section id="categories" className="scroll-mt-20 py-24 border-b border-brand-sand/15 bg-brand-beige/10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-brown/70">Wander through files</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-brown">
                Shelves by Category
              </h2>
              <div className="w-12 h-1 bg-brand-gold/60 mx-auto rounded" />
            </div>

            {/* 12 Illustrated category cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat, idx) => (
                <Link href="/login" key={idx} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                    className={`group relative rounded-xl border ${cat.border} bg-brand-cream p-5 text-center flex flex-col justify-center items-center gap-3 transition-all duration-300 hover:shadow-gold-glow hover:-translate-y-1 hover:border-brand-gold/40 cursor-pointer`}
                  >
                    <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition duration-300">
                      {cat.icon}
                    </span>
                    <h3 className="font-display font-bold text-sm sm:text-base text-brand-brown group-hover:text-brand-gold transition duration-300">
                      {cat.name}
                    </h3>
                    <span className="absolute bottom-2 right-2 text-[10px] text-brand-brown/40 group-hover:text-brand-gold/70 opacity-0 group-hover:opacity-100 transition duration-300">
                      Explore →
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* READING JOURNEY TIMELINE */}
        <section id="journey" className="scroll-mt-20 py-24 border-b border-brand-sand/15 bg-brand-cream/50 relative">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-xl mx-auto space-y-4 mb-20">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">How it works</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-brown">
                Your Reading Journey
              </h2>
              <p className="text-sm text-brand-brown/65">Follow the steps of an avid reader's life on BookVerse.</p>
              <div className="w-12 h-1 bg-brand-gold/60 mx-auto rounded" />
            </div>

            {/* Timeline Row */}
            <div className="relative">
              {/* Central Line (Desktop) */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-brand-sand/30 -translate-y-1/2 hidden lg:block" />

              <div className="grid gap-8 lg:grid-cols-5 md:grid-cols-2">
                {timelineSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.12 }}
                      className="flex flex-col items-center text-center relative bg-brand-cream p-6 rounded-2xl border border-brand-sand/20 shadow-sm z-10 transition duration-300 hover:shadow-brown-glow"
                    >
                      {/* Step Number Badge */}
                      <span className="absolute -top-3 left-4 px-2 py-0.5 text-[10px] font-bold text-brand-gold bg-brand-dark rounded-md">
                        {step.number}
                      </span>
                      
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold mb-4 ring-2 ring-brand-gold/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <h3 className="font-display text-lg font-bold text-brand-brown">
                        {step.title}
                      </h3>
                      
                      <p className="mt-2 text-xs leading-relaxed text-brand-brown/70">
                        {step.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* COMMUNITY SECTION */}
        <section id="community" className="scroll-mt-20 py-24 border-b border-brand-sand/15 bg-brand-beige/20 relative">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              
              {/* Left Column: Interactive Community Dashboard */}
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-green">Living Lounge</span>
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-brand-brown">
                  Meet the Readers at the Salon
                </h2>
                <p className="text-base text-brand-brown/75 leading-relaxed">
                  BookVerse is more than review sheets. It's a busy reading lounge. Swap book tags, debate cliffhangers, track seasonal challenges, and find your literary peers.
                </p>

                {/* Reader Review Snippets with speech bubbles */}
                <div className="space-y-4 pt-4">
                  {/* Bubble 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-start"
                  >
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-brand-brown text-brand-cream text-xs font-bold">
                      SM
                    </div>
                    <div className="relative rounded-2xl bg-brand-cream border border-brand-sand/30 p-4 shadow-sm">
                      <p className="text-xs font-bold text-brand-brown">Siddharth Mishra</p>
                      <p className="text-xs italic text-brand-brown/70 mt-1">
                        "Just finished 'The Shadow of the Wind'. I literally couldn't sleep until I reached the final page. The writing is so romantic and haunting!"
                      </p>
                    </div>
                  </motion.div>

                  {/* Bubble 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-start flex-row-reverse"
                  >
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-brand-green text-brand-cream text-xs font-bold">
                      AL
                    </div>
                    <div className="relative rounded-2xl bg-brand-cream border border-brand-sand/30 p-4 shadow-sm">
                      <p className="text-xs font-bold text-brand-brown text-right">Anya Lindqvist</p>
                      <p className="text-xs italic text-brand-brown/70 mt-1">
                        "I'm tracking the 2026 Winter Classic Challenge! Already logged 4 classics this month. Anyone reading Jane Austen right now?"
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Trending & Active Reviewers Widget */}
              <div className="rounded-2xl border border-brand-sand/30 bg-brand-cream p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-brand-sand/20 pb-4">
                  <h3 className="font-display text-lg font-bold text-brand-brown flex items-center gap-2">
                    <Users size={18} className="text-brand-gold" />
                    Community Center
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold bg-brand-dark text-brand-cream px-2 py-0.5 rounded">
                    Realtime
                  </span>
                </div>

                {/* Challenges & Badges list */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown/65 mb-2">Active Challenge</h4>
                    <div className="rounded-xl bg-brand-beige/35 border border-brand-sand/20 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <p className="text-xs font-bold text-brand-brown">Forgotten Classics Log</p>
                          <p className="text-[10px] text-brand-brown/60">Read 3 books published before 1900</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-brand-green">1,240 Joiners</span>
                    </div>
                  </div>

                  {/* Top active reviewers */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown/65 mb-2">Top Reviewers</h4>
                    <div className="space-y-2">
                      {[
                        { name: "Priya Sharma", logs: 42, points: "4.8k" },
                        { name: "Marcus Chen", logs: 38, points: "4.2k" },
                        { name: "Siddharth Mishra", logs: 35, points: "3.9k" }
                      ].map((rev, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-xs p-2 bg-brand-cream hover:bg-brand-beige/20 rounded-lg transition border border-transparent hover:border-brand-sand/15">
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-center font-bold text-brand-brown/40">0{rIdx + 1}</span>
                            <span className="font-bold text-brand-brown">{rev.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-brand-brown/60">
                            <span>{rev.logs} logs</span>
                            <span className="font-bold text-brand-gold">{rev.points} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="scroll-mt-20 py-24 border-b border-brand-sand/15 bg-brand-cream/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-xl mx-auto space-y-4 mb-20">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green">Features</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-brown">
                Everything to Map Your Library
              </h2>
              <div className="w-12 h-1 bg-brand-gold/60 mx-auto rounded" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group relative rounded-2xl border border-brand-sand/35 bg-brand-cream/70 p-6 transition-all duration-300 hover:shadow-gold-glow hover:-translate-y-1 hover:bg-brand-cream"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold mb-4 group-hover:scale-105 transition duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-brand-brown leading-tight mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-brand-brown/70">
                      {feat.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* STATISTICS COZY SECTION */}
        <section className="py-20 border-b border-brand-sand/15 bg-brand-beige/25">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              <AnimatedCounter value="100K+" label="Books Catalogued" />
              <AnimatedCounter value="50K+" label="Reviews Drafted" />
              <AnimatedCounter value="10K+" label="Active Readers" />
              <AnimatedCounter value="500+" label="Verified Authors" />
            </div>
          </div>
        </section>

        {/* CALL TO ACTION (CTA) SECTION */}
        <section className="py-24 bg-brand-cream">
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-brand-sand/40 bg-brand-dark text-brand-cream px-8 py-16 text-center sm:px-16 shadow-2xl">
              
              {/* Silhouette Graphics */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4),transparent_50%)]" />
              <div className="pointer-events-none absolute -bottom-24 -left-12 opacity-15 text-9xl font-serif">
                📖
              </div>
              <div className="pointer-events-none absolute -top-12 -right-12 opacity-15 text-8xl font-serif">
                🌿
              </div>

              <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream/10 ring-1 ring-brand-cream/25">
                  <Bookmark className="h-5 w-5 text-brand-gold" />
                </div>
                
                <h2 className="font-display text-4xl sm:text-5xl font-black text-brand-cream leading-tight">
                  Start Your Reading Journey Today.
                </h2>
                
                <p className="text-base text-brand-beige/85 leading-relaxed">
                  Join a warm sanctuary built for bookworms. Draft your bookshelf, discuss cliffhangers, set habits, and discover hidden gems in seconds.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row items-center justify-center pt-6">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-8 py-4 text-base font-bold text-brand-dark shadow-md shadow-brand-gold/10 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-gold/90"
                  >
                    Join Now
                  </Link>
                  <Link
                    href="#featured"
                    className="inline-flex items-center justify-center rounded-full border border-brand-cream/25 bg-brand-cream/5 px-8 py-4 text-base font-bold text-brand-cream hover:bg-brand-cream/10 transition-all duration-300"
                  >
                    Explore Books
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
