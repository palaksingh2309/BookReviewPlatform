"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Star, Feather, Compass, Heart } from "lucide-react";

export default function Hero() {
  // Animation variants for floating elements
  const floatAnimation = (delay: number, duration: number = 5, yOffset: number = 15) => ({
    animate: {
      y: [0, -yOffset, 0],
      rotate: [0, 8, -8, 0],
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut" as any,
      delay,
    },
  });

  const leafAnimation = (delay: number) => ({
    animate: {
      y: [0, -10, 0],
      x: [0, 8, -8, 0],
      rotate: [0, 15, -15, 0],
    },
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as any,
      delay,
    },
  });

  return (
    <section className="relative overflow-hidden bg-brand-cream py-16 sm:py-24 lg:py-32 bg-library-pattern border-b border-brand-sand/20">
      {/* Decorative Warm Atmospheres */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[15%] top-[10%] h-[350px] w-[350px] rounded-full bg-brand-sand/15 blur-[100px]" />
        <div className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-brand-gold/10 blur-[120px]" />
        <div className="absolute left-[40%] bottom-[5%] h-[300px] w-[300px] rounded-full bg-brand-green/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Text and Copy Column */}
          <div className="text-center lg:col-span-7 lg:text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-sand/40 bg-brand-beige/50 px-4 py-2 text-xs font-semibold text-brand-brown shadow-sm"
            >
              <Sparkles size={14} className="text-brand-gold fill-brand-gold" />
              <span>Welcome to the cozy reader's café</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-[2.75rem] font-bold leading-[1.1] tracking-tight text-brand-brown sm:text-6xl"
            >
              Every Book Holds a{" "}
              <span className="relative inline-block text-brand-gold">
                World
                <span className="absolute left-0 bottom-1 w-full h-[6px] bg-brand-beige -z-10 rounded-full" />
              </span>{" "}
              Waiting to Be Discovered.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto max-w-xl text-lg leading-relaxed text-brand-brown/70 lg:mx-0 sm:text-xl"
            >
              Read reviews, discover hidden gems, organize your reading journey, and connect with fellow book lovers.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center justify-center lg:justify-start pt-4"
            >
              <Link
                href="#featured"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-brown px-8 py-4 text-base font-bold text-brand-cream shadow-md shadow-brand-brown/10 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-brown/95 hover:shadow-lg hover:shadow-brand-brown/20"
              >
                Explore Books
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border border-brand-sand/55 bg-brand-cream/80 px-8 py-4 text-base font-bold text-brand-brown hover:bg-brand-beige/40 shadow-sm transition-all duration-300 hover:scale-[1.02]"
              >
                Join the Community
              </Link>
            </motion.div>

            {/* Micro Stats & Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex flex-col gap-5 sm:flex-row sm:items-center justify-center lg:justify-start border-t border-brand-sand/30 pt-8"
            >
              <div className="flex -space-x-3 justify-center">
                {["A", "E", "H", "K", "R"].map((lettr, i) => (
                  <div
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-cream text-xs font-bold text-brand-cream bg-gradient-to-br ${
                      i % 3 === 0
                        ? "from-brand-brown to-brand-sand"
                        : i % 3 === 1
                        ? "from-brand-green to-brand-sand"
                        : "from-brand-gold to-brand-brown"
                    }`}
                    style={{ zIndex: 5 - i }}
                  >
                    {lettr}
                  </div>
                ))}
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-brand-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                  <span className="text-sm font-bold text-brand-brown ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-brand-brown/65 mt-0.5">
                  Loved by 10,000+ avid readers on the platform
                </p>
              </div>
            </motion.div>
          </div>

          {/* SVG Corner & Cozy Illustration Column */}
          <div className="relative flex justify-center lg:col-span-5">
            {/* Pulsing lamp shadow glow */}
            <div className="absolute right-[22%] top-[12%] -z-10 h-44 w-44 rounded-full bg-brand-gold/20 blur-2xl animate-pulse duration-5000" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[460px] drop-shadow-xl"
            >
              {/* Cozy Room Reading Setup SVG */}
              <svg
                viewBox="0 0 500 450"
                className="w-full h-auto overflow-visible select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lamp Warm Glow Overlay */}
                <path
                  d="M 330 110 L 150 420 L 480 420 Z"
                  fill="url(#lamp-glow-gradient)"
                  opacity="0.15"
                />

                <defs>
                  {/* Warm light cone gradient */}
                  <linearGradient id="lamp-glow-gradient" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#D4A017" stopOpacity="1" />
                    <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
                  </linearGradient>

                  {/* Wood finish gradient */}
                  <linearGradient id="desk-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8A97E" />
                    <stop offset="100%" stopColor="#5C4033" />
                  </linearGradient>

                  {/* Ceramic mug gradient */}
                  <linearGradient id="mug-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F5EBDD" />
                    <stop offset="100%" stopColor="#C8A97E" />
                  </linearGradient>
                </defs>

                {/* Background Shelf Silhouette */}
                <rect x="20" y="40" width="460" height="15" rx="5" fill="#C8A97E" opacity="0.4" />
                {/* Silhouette Books on Shelf */}
                <path d="M 40 40 L 40 10 H 52 L 52 40 Z" fill="#5C4033" opacity="0.3" />
                <path d="M 55 40 L 55 15 H 65 L 65 40 Z" fill="#556B2F" opacity="0.3" />
                <path d="M 68 40 L 68 8 H 80 L 80 40 Z" fill="#D4A017" opacity="0.3" />
                <path d="M 83 40 L 98 12 H 108 L 93 40 Z" fill="#5C4033" opacity="0.3" />

                {/* Main Wooden Writing Desk */}
                <rect x="0" y="400" width="500" height="50" rx="10" fill="url(#desk-gradient)" />
                <rect x="20" y="415" width="130" height="25" rx="4" fill="#2A1B10" opacity="0.3" />
                <rect x="350" y="415" width="130" height="25" rx="4" fill="#2A1B10" opacity="0.3" />

                {/* Cozy Stack of Vintage Books */}
                {/* Book 1 (Bottom - Forest Green) */}
                <rect x="60" y="360" width="160" height="40" rx="4" fill="#556B2F" />
                <rect x="65" y="365" width="150" height="4" fill="#D4A017" opacity="0.5" />
                <rect x="70" y="375" width="25" height="10" fill="#FAF7F2" opacity="0.2" />
                
                {/* Book 2 (Middle - Gold Spine) */}
                <rect x="80" y="325" width="130" height="35" rx="3" fill="#D4A017" />
                <rect x="90" y="330" width="110" height="4" fill="#5C4033" opacity="0.4" />
                {/* Ribbon bookmark hanging down */}
                <path d="M 190 340 L 195 410 L 188 405 Z" fill="#5C4033" />

                {/* Book 3 (Top - Leather Brown) */}
                <rect x="70" y="295" width="140" height="30" rx="2" fill="#5C4033" />
                <circle cx="85" cy="310" r="5" fill="#D4A017" />
                <rect x="100" y="308" width="60" height="4" fill="#FAF7F2" opacity="0.3" />

                {/* Cozy Terracotta Plant Pot */}
                <path d="M 370 400 L 360 340 H 410 L 400 400 Z" fill="#C8A97E" />
                <ellipse cx="385" cy="340" rx="25" ry="5" fill="#B29065" />
                {/* Plant Leaves looping and falling */}
                <path d="M 380 340 Q 360 300 340 310 Q 350 330 380 340 Z" fill="#556B2F" />
                <path d="M 390 340 Q 420 280 435 295 Q 410 320 390 340 Z" fill="#556B2F" />
                <path d="M 385 340 Q 395 270 380 260 Q 370 290 385 340 Z" fill="#8B9862" />
                <path d="M 370 360 Q 350 370 330 350 Q 340 390 370 360 Z" fill="#556B2F" opacity="0.8" />
                <path d="M 400 370 Q 425 365 440 385 Q 410 390 400 370 Z" fill="#8B9862" opacity="0.9" />

                {/* Open Book in Center (Focus Point) */}
                <g transform="translate(180, 310)">
                  {/* Outer Hard Cover */}
                  <path d="M 10 75 Q 85 85 160 70 L 165 -10 Q 90 5 15 -10 Z" fill="#5C4033" />
                  
                  {/* Left Side Pages */}
                  <path d="M 15 -8 Q 90 7 165 -8 L 160 72 Q 85 87 10 72 Z" fill="#FAF7F2" />
                  <path d="M 20 -5 Q 92 10 165 -5 L 160 75 Q 87 90 12 75 Z" fill="#F5EBDD" />
                  <path d="M 23 -3 Q 94 12 165 -3 L 160 77 Q 89 92 14 77 Z" fill="#FAF7F2" />
                  
                  {/* Page Spine center divider */}
                  <line x1="88" y1="-3" x2="88" y2="83" stroke="#C8A97E" strokeWidth="2.5" />

                  {/* Left side text lines (Subtle aesthetic representation) */}
                  <line x1="35" y1="12" x2="70" y2="12" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3,3" />
                  <line x1="35" y1="22" x2="75" y2="22" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="2,2" />
                  <line x1="35" y1="32" x2="65" y2="32" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" />
                  <line x1="35" y1="42" x2="72" y2="42" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="4,2" />
                  <line x1="35" y1="52" x2="68" y2="52" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" />

                  {/* Right side text lines */}
                  <line x1="102" y1="12" x2="140" y2="12" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" />
                  <line x1="102" y1="22" x2="145" y2="22" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3,1" />
                  <line x1="102" y1="32" x2="135" y2="32" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" />
                  <line x1="102" y1="42" x2="142" y2="42" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="2,3" />
                  <line x1="102" y1="52" x2="138" y2="52" stroke="#5c4033" strokeOpacity="0.4" strokeWidth="2" />

                  {/* Golden Bookmark Ribbon */}
                  <path d="M 88 5 L 105 105 L 98 100 L 91 103 Z" fill="#D4A017" />
                </g>

                {/* Cozy Steaming Coffee Cup */}
                <path d="M 285 400 C 285 365 330 365 330 400 Z" fill="url(#mug-gradient)" />
                <path d="M 325 375 C 340 375 340 390 325 390" fill="none" stroke="#C8A97E" strokeWidth="5" strokeLinecap="round" />
                
                {/* Cozy Plate/Saucer under Mug */}
                <ellipse cx="308" cy="400" rx="30" ry="6" fill="#FAF7F2" stroke="#C8A97E" strokeWidth="2.5" />

                {/* Reading Desk Lamp Casting Light */}
                {/* Base */}
                <rect x="290" y="100" width="80" height="8" rx="4" fill="#C8A97E" />
                {/* Arm */}
                <path d="M 330 100 C 330 50 360 40 370 70" fill="none" stroke="#C8A97E" strokeWidth="6" strokeLinecap="round" />
                {/* Shade */}
                <path d="M 345 70 C 345 50 395 50 395 70 Z" fill="#5C4033" />
                <ellipse cx="370" cy="70" rx="25" ry="6" fill="#D4A017" />
                
                {/* Cozy glowing bulb inside */}
                <circle cx="370" cy="73" r="5" fill="#FAF7F2" />
              </svg>

              {/* Steam waves animated with Framer Motion */}
              <div className="absolute right-[33.5%] bottom-[12.5%] flex flex-col gap-1 items-center pointer-events-none">
                <motion.span
                  animate={{ y: [0, -25], opacity: [0, 0.7, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                  className="w-[2px] h-4 bg-brand-sand/50 blur-[1px] rounded"
                />
                <motion.span
                  animate={{ y: [0, -25], opacity: [0, 0.6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 0.8 }}
                  className="w-[2.5px] h-3 bg-brand-sand/40 blur-[1px] rounded -translate-x-[2px]"
                />
              </div>
            </motion.div>

            {/* Floating Decorative Doodles around Hero Visuals */}
            
            {/* Sparkles */}
            <motion.div
              {...floatAnimation(0.2, 5, 12)}
              className="absolute left-[8%] top-[18%] text-brand-gold fill-brand-gold opacity-80"
            >
              <Sparkles size={26} className="fill-brand-gold" />
            </motion.div>
            
            <motion.div
              {...floatAnimation(1.5, 4.5, 15)}
              className="absolute right-[5%] top-[12%] text-brand-gold fill-brand-gold opacity-65"
            >
              <Sparkles size={16} />
            </motion.div>

            {/* Cozy Feather */}
            <motion.div
              {...floatAnimation(0.8, 6, 18)}
              className="absolute left-[3%] bottom-[28%] text-brand-sand/70 rotate-[35deg]"
              aria-hidden="true"
            >
              <Feather size={32} />
            </motion.div>

            {/* Tiny Floating Books */}
            <motion.div
              {...floatAnimation(1.2, 5.5, 20)}
              className="absolute left-[15%] top-[45%] rounded-md bg-brand-beige border border-brand-sand/65 p-2 text-brand-brown flex shadow-lg -rotate-[15deg] z-20"
            >
              <BookOpen size={16} />
            </motion.div>

            <motion.div
              {...floatAnimation(2.1, 5, 14)}
              className="absolute right-[8%] bottom-[40%] rounded-md bg-brand-brown border border-brand-sand/30 p-1.5 text-brand-cream flex shadow-md rotate-[12deg] z-20"
            >
              <BookOpen size={12} />
            </motion.div>

            {/* Floating Leaves */}
            <motion.div
              {...leafAnimation(0.5)}
              className="absolute right-[22%] top-[4%] text-brand-green/60"
            >
              <Compass size={20} className="rotate-45" />
            </motion.div>

            <motion.div
              {...leafAnimation(1.7)}
              className="absolute left-[38%] top-[10%] text-brand-green/50"
            >
              <Heart size={14} className="fill-brand-green/20" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
