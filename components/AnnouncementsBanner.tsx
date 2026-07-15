"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Megaphone, X } from "lucide-react";
import { getActiveAnnouncementAction } from "../actions/admin";

export default function AnnouncementsBanner() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<{ title: string; content: string } | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    async function checkAnnouncement() {
      try {
        const res = await getActiveAnnouncementAction();
        if (res.success && res.announcement) {
          const banner = res.announcement as { title: string; content: string };
          // Check if user dismissed this specific banner before
          const dismissedTitle = localStorage.getItem("dismissed_announcement_title");
          if (dismissedTitle === banner.title) {
            setDismissed(true);
          } else {
            setAnnouncement(banner);
            setDismissed(false);
          }
        }
      } catch (err) {
        console.error("Failed to load active announcement:", err);
      }
    }
    checkAnnouncement();
  }, []);

  if (dismissed || !announcement) return null;

  return (
    <div className="bg-indigo-600 text-white py-2 px-6 flex items-center justify-between text-xs sm:text-sm font-sans relative z-50 animate-fade-in border-b border-indigo-500/20 shadow-md">
      <div className="flex items-center gap-2 max-w-4xl mx-auto text-center justify-center">
        <Megaphone size={16} className="animate-bounce shrink-0 text-indigo-200" />
        <span className="font-bold text-white tracking-wide">
          {announcement.title}:
        </span>
        <span className="text-indigo-100 font-medium">
          {announcement.content}
        </span>
      </div>
      <button
        onClick={() => {
          localStorage.setItem("dismissed_announcement_title", announcement.title);
          setDismissed(true);
        }}
        className="text-indigo-200 hover:text-white shrink-0 p-1 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}
