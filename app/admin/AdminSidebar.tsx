"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LogOut, 
  Menu, 
  X, 
  BookOpen,
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  AlertTriangle,
  Tag,
  Megaphone,
  BarChart3,
  Settings
} from "lucide-react";
import { adminLogoutAction } from "../../actions/admin";
import { useToast } from "../../components/Toast";

interface AdminSidebarProps {
  admin: {
    username: string;
    role: string;
  };
}

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Books", href: "/admin/books", icon: BookOpen },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Community Posts", href: "/admin/community-posts", icon: FileText },
  { label: "Reports", href: "/admin/reports", icon: AlertTriangle },
  { label: "Genres", href: "/admin/genres", icon: Tag },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    try {
      await adminLogoutAction();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of the admin portal.",
        type: "success",
      });
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout. Please try again.",
        type: "error",
      });
    }
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      <div className="space-y-8">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-400/30">
            <BookOpen className="h-5 w-5 text-indigo-400" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-white tracking-wide">
              BookVerse
            </h1>
            <p className="text-[10px] font-semibold text-indigo-400/80 uppercase tracking-widest mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 ring-1 ring-indigo-400/30"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110 text-white" : "text-neutral-400 group-hover:text-neutral-200"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile info & Logout */}
      <div className="space-y-4 border-t border-white/5 pt-4 px-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 shrink-0">
            {admin.username[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {admin.username}
            </p>
            <p className="text-[11px] text-neutral-500 truncate capitalize font-medium">
              {admin.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex h-16 w-full items-center justify-between border-b border-white/10 bg-neutral-900 px-6 sticky top-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
            <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
          </span>
          <span className="font-display font-bold text-white text-md">BookVerse Admin</span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Slider Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative flex w-64 max-w-xs flex-col bg-neutral-900 border-r border-white/10 z-10 animate-slide-in">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <div className="flex-1 overflow-y-auto mt-10">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block fixed top-0 bottom-0 left-0 w-64 border-r border-white/10 bg-neutral-900/90 backdrop-blur-xl z-30">
        <SidebarContent />
      </aside>
    </>
  );
}
