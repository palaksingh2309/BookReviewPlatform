import React from "react";
import { BookOpen, Coffee } from "lucide-react";

export const metadata = {
  title: "Under Maintenance — BookVerse",
  description: "BookVerse is currently undergoing scheduled maintenance. We'll be back shortly with more books and reviews!",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper-texture text-neutral-200 relative px-6 py-12">
      {/* Visual background lights - warm styling */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[30rem] w-[30rem] rounded-full bg-pink-500/5 blur-[120px]" />
      </div>

      <div className="max-w-md text-center space-y-8 animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-400/20 mb-4 animate-bounce">
            <BookOpen className="h-6 w-6 text-indigo-700" />
          </span>
          <h1 className="font-display text-2xl font-black text-neutral-100 tracking-wide">
            BookVerse
          </h1>
        </div>

        {/* Maintenance Message */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-8 backdrop-blur-md shadow-xl text-neutral-300 space-y-6">
          <div className="flex justify-center text-pink-700">
            <Coffee size={48} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-white">Cozying Up Our Library</h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              BookVerse is currently undergoing scheduled maintenance to add premium new features and organize our catalogs. 
            </p>
            <p className="text-xs text-neutral-500 font-sans leading-relaxed">
              Pour a fresh cup of coffee and check back shortly! We will be open for reading, reviewing, and connecting very soon.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 font-sans">
          Organizing shelves • Be right back
        </p>
      </div>
    </div>
  );
}
