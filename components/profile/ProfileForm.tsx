"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Sparkles, User, FileText, Heart, Shield } from "lucide-react";
import { getProfile, updateProfile } from "../../services/profile";

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    favorite_genre: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getProfile();
        if (res) {
          const { data, error } = res;
          if (error) {
            console.error("Error fetching profile:", error.message);
          }
          if (data) {
          setFormData({
            username: data.username || "",
            full_name: data.full_name || "",
            bio: data.bio || "",
            favorite_genre: data.favorite_genre || "",
          });
        }
        }
      } catch (err) {
        console.error("Unexpected profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const genres = [
    "Fiction",
    "Non-Fiction",
    "Sci-fi & Fantasy",
    "Mystery & Thriller",
    "Biography",
    "History",
    "Self-improvement",
    "Business & Finance",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await updateProfile(formData);
      if (response && response.error) {
        setStatus({
          type: "error",
          message: response.error.message || "Failed to update profile.",
        });
      } else {
        setStatus({
          type: "success",
          message: "Your profile has been updated successfully!",
        });
        // Clear success message after 4 seconds
        setTimeout(() => setStatus(null), 4000);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm transition-all duration-300 ${
            status.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <User size={16} className="text-indigo-400" />
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              placeholder="e.g. bookworm99"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <Shield size={16} className="text-indigo-400" />
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>
        </div>

        {/* Favorite Genre */}
        <div className="space-y-2">
          <label htmlFor="favoriteGenre" className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <Heart size={16} className="text-indigo-400" />
            Favorite Genre
          </label>
          <select
            id="favoriteGenre"
            value={formData.favorite_genre}
            onChange={(e) => setFormData({ ...formData, favorite_genre: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 appearance-none [&>option]:bg-neutral-900"
          >
            <option value="" disabled>Select your favorite genre</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <FileText size={16} className="text-indigo-400" />
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            placeholder="Tell the community about yourself, your reading goals, or your favorite authors..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-indigo-600/10"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Save Profile Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}