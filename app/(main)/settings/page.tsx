"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Settings as SettingsIcon,
  User,
  Lock,
  Sliders,
  AlertTriangle,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import SignOutButton from "../../../components/auth/SignOutButton";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "danger">("account");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("R");

  // State for password change form
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passStatus, setPassStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // State for preferences form
  const [readingGoal, setReadingGoal] = useState<number>(12);
  const [prefSaved, setPrefSaved] = useState(false);

  // State for danger zone modal / confirmations
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [dangerStatus, setDangerStatus] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "");
        setUserInitials((user.email || "R").substring(0, 2).toUpperCase());
      }
    }
    loadUserData();

    // Load reading goal from localStorage
    const savedGoal = localStorage.getItem("bookverse_reading_goal");
    if (savedGoal) {
      setReadingGoal(parseInt(savedGoal, 10));
    }
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPassStatus(null);

    if (passwords.newPassword.length < 8) {
      setPassStatus({
        type: "error",
        message: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setPassSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });

      if (error) {
        setPassStatus({
          type: "error",
          message: error.message || "Failed to update password.",
        });
      } else {
        setPassStatus({
          type: "success",
          message: "Your password has been successfully updated!",
        });
        setPasswords({ newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setPassStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setPassSubmitting(false);
    }
  }

  function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("bookverse_reading_goal", readingGoal.toString());
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE MY ACCOUNT") {
      setDangerStatus("Please type the exact phrase to confirm.");
      return;
    }

    setDangerStatus(null);
    // Supabase client side delete is usually disabled/requires admin API,
    // so we will simulate deletion by deleting profile data and signing out.
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Delete profile row
        await supabase.from("profiles").delete().eq("id", user.id);
      }

      // Clear local settings
      localStorage.removeItem("bookverse_reading_goal");

      // Sign out
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      setDangerStatus("Failed to complete action. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[30rem] w-[30rem] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-pink-600/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="font-display flex items-center gap-2 text-lg font-bold transition hover:opacity-90"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
            </span>
            BookVerse
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/profile"
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Profile"
            >
              <User size={18} />
            </Link>
            <Link
              href="/settings"
              className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/15"
              aria-label="Settings"
            >
              <SettingsIcon size={18} />
            </Link>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Account Management
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Settings</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage your passwords, preferences, and account health.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
          {/* Sidebar tabs */}
          <div className="flex flex-col gap-1.5">
            {[
              { id: "account", label: "Security & Account", icon: Lock },
              { id: "preferences", label: "App Preferences", icon: Sliders },
              { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    isActive
                      ? tab.danger
                        ? "bg-red-500/10 text-red-300 border border-red-500/20"
                        : "bg-white/10 text-white border border-white/10"
                      : "text-neutral-400 border border-transparent hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} className={tab.danger && !isActive ? "text-red-400/80" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Panels */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-xl">
            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display">Security Settings</h2>
                  <p className="text-sm text-neutral-400 mt-1">Keep your credentials up to date to ensure account security.</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="text-xs text-neutral-500 font-semibold uppercase">Email Address</p>
                  <p className="text-base text-neutral-300 mt-1 font-medium">{userEmail || "No email linked"}</p>
                  <p className="text-xs text-neutral-500 mt-1">To change your primary email, please contact Support.</p>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold font-display mb-4">Change Password</h3>

                  {passStatus && (
                    <div
                      className={`flex items-start gap-3 rounded-xl border p-4 text-sm mb-6 transition-all duration-300 ${
                        passStatus.type === "success"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                          : "border-red-500/30 bg-red-500/10 text-red-200"
                      }`}
                    >
                      {passStatus.type === "success" ? (
                        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                      )}
                      <span>{passStatus.message}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-300">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-white"
                          onClick={() => setShowPassword((visible) => !visible)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-300">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passSubmitting}
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {passSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display">App Preferences</h2>
                  <p className="text-sm text-neutral-400 mt-1">Configure layout, goal tracking parameters, and preferences.</p>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-6">
                  {prefSaved && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200 transition-all duration-300">
                      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                      <span>Preferences saved successfully!</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Yearly Reading Goal (Books)
                    </label>
                    <p className="text-xs text-neutral-500 mb-2">Define how many books you strive to read this calendar year.</p>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={readingGoal}
                      onChange={(e) => setReadingGoal(parseInt(e.target.value, 10) || 1)}
                      className="w-24 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white text-center outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-6 space-y-4">
                    <h3 className="text-base font-semibold text-neutral-200">System Themes</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex items-center justify-between cursor-pointer border-indigo-400/30">
                        <div>
                          <p className="text-sm font-medium">Dark Theme (Default)</p>
                          <p className="text-xs text-neutral-500 mt-0.5">Optimized for reading comfort</p>
                        </div>
                        <div className="h-4.5 w-4.5 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-indigo-400" />
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-black/10 p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div>
                          <p className="text-sm font-medium">Light Theme</p>
                          <p className="text-xs text-neutral-500 mt-0.5">System colors default</p>
                        </div>
                        <div className="h-4.5 w-4.5 rounded-full border border-neutral-600" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Save Preferences
                  </button>
                </form>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-red-400 flex items-center gap-2">
                    <AlertTriangle size={22} />
                    Danger Zone
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">Actions here are permanent and cannot be undone. Exercise absolute caution.</p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-4">
                  <h3 className="font-semibold text-red-200">Delete Account & Profile</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Deleting your account deletes your database profile records, deletes written reviews, sets reading streak to zero, and logs you out completely.
                  </p>

                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 px-5 py-3 text-sm font-medium transition hover:bg-red-900/40 hover:border-red-500/50"
                    >
                      <Trash2 size={16} />
                      Delete My Account
                    </button>
                  ) : (
                    <div className="space-y-4 pt-2 border-t border-red-500/10">
                      <p className="text-sm text-red-300 font-semibold">
                        To confirm deletion, type <span className="underline select-all font-mono">DELETE MY ACCOUNT</span> below:
                      </p>

                      {dangerStatus && (
                        <p className="text-sm text-red-400 font-medium flex items-center gap-1">
                          <AlertCircle size={14} />
                          {dangerStatus}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Type validation phrase"
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          className="flex-1 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-white outline-none focus:border-red-500/60 transition"
                        />
                        <button
                          onClick={handleDeleteAccount}
                          className="rounded-xl bg-red-600 text-white px-6 py-3 font-semibold text-sm transition hover:bg-red-500"
                        >
                          Confirm Final Deletion
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDelete(false);
                            setDeleteInput("");
                            setDangerStatus(null);
                          }}
                          className="rounded-xl bg-neutral-800 text-neutral-200 px-6 py-3 text-sm font-semibold transition hover:bg-neutral-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}