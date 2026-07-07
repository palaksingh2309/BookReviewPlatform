"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { logout } from "../../services/auth";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">
        {loading ? "Signing out..." : "Sign out"}
      </span>
    </button>
  );
}
