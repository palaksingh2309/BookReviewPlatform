"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Settings, 
  Lock, 
  ShieldAlert, 
  UserCheck, 
  HelpCircle,
  Loader2, 
  Save, 
  Globe, 
  ToggleLeft, 
  ToggleRight,
  Database
} from "lucide-react";

import { 
  getSettingsAction, 
  updateSettingsAction, 
  updateAdminPasswordAction 
} from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface SiteSettings {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  community_enabled: boolean;
  site_name: string;
  api_settings: any;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  
  // Settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPending, startTransition] = useTransition();

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await getSettingsAction();
        if (res.success && res.settings) {
          setSettings(res.settings as SiteSettings);
        } else {
          toast({
            title: "Settings error",
            description: res.error || "Could not retrieve configs.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Network error",
          description: "Database is unreachable.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  // Save General settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    startTransition(async () => {
      try {
        const res = await updateSettingsAction(settings);
        if (res.success) {
          toast({
            title: "Settings updated",
            description: "Site configuration saved and applied.",
            type: "success",
          });
        } else {
          toast({
            title: "Save failed",
            description: res.error || "Please try again.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Could not write to settings.",
          type: "error",
        });
      }
    });
  }

  // Update Admin Password
  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPass = formData.get("newPassword") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    if (newPass !== confirmPass) {
      toast({
        title: "Match failed",
        description: "New passwords do not match.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateAdminPasswordAction(formData);
        if (res.success) {
          toast({
            title: "Password updated",
            description: "Your admin portal credentials have been changed.",
            type: "success",
          });
          (e.target as HTMLFormElement).reset();
        } else {
          toast({
            title: "Change failed",
            description: res.error || "Verify current password is correct.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Could not execute credential update.",
          type: "error",
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm text-neutral-500 font-medium">Loading settings panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Portal Settings</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Adjust sitewide features, configure APIs, or update administrative security credentials.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/10 pb-px">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "general"
              ? "border-indigo-500 text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "security"
              ? "border-indigo-500 text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Admin Security
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && settings && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-4 border-b border-white/5">
              <Globe className="text-indigo-400" size={16} />
              Sitewide Configuration
            </h3>

            {/* Site Name */}
            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-semibold text-neutral-400">Site Name Title</label>
              <input
                type="text"
                required
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
              />
            </div>

            {/* Config Toggles */}
            <div className="space-y-4 pt-2">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-white/5 max-w-2xl">
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-yellow-500" />
                    Maintenance Mode
                  </span>
                  <p className="text-xs text-neutral-500 mt-1 font-sans">
                    Block normal readers from accessing main page routes. Admins will retain console access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  {settings.maintenance_mode ? (
                    <ToggleRight size={38} className="text-yellow-500" />
                  ) : (
                    <ToggleLeft size={38} className="text-neutral-600" />
                  )}
                </button>
              </div>

              {/* User Registration Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-white/5 max-w-2xl">
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <UserCheck size={14} className="text-indigo-400" />
                    Open Signups / Registrations
                  </span>
                  <p className="text-xs text-neutral-500 mt-1 font-sans">
                    Allow new visitors to register accounts. Turning off closes signups.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, registration_enabled: !settings.registration_enabled })}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  {settings.registration_enabled ? (
                    <ToggleRight size={38} className="text-indigo-500" />
                  ) : (
                    <ToggleLeft size={38} className="text-neutral-600" />
                  )}
                </button>
              </div>

              {/* Community Feed Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-white/5 max-w-2xl">
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Database size={14} className="text-emerald-400" />
                    Community Feed Module
                  </span>
                  <p className="text-xs text-neutral-500 mt-1 font-sans">
                    Enable the community social feed (`/feed`). Turning off disables discussion pages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, community_enabled: !settings.community_enabled })}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  {settings.community_enabled ? (
                    <ToggleRight size={38} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={38} className="text-neutral-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end max-w-4xl">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-xs font-semibold text-white transition-all shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving settings...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Security Credentials Tab */}
      {activeTab === "security" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-5 max-w-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-4 border-b border-white/5">
              <Lock className="text-indigo-400" size={16} />
              Change Admin Password
            </h3>

            {/* Current Password */}
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="text-xs font-semibold text-neutral-400">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-xs font-semibold text-neutral-400">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-neutral-400">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end max-w-lg">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-xs font-semibold text-white transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  Update Credentials
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
