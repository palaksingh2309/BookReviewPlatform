"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Megaphone, 
  X, 
  Eye, 
  EyeOff, 
  AlertTriangle 
} from "lucide-react";

import { 
  getAnnouncementsAction, 
  upsertAnnouncementAction, 
  deleteAnnouncementAction 
} from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnounce, setEditingAnnounce] = useState<Partial<Announcement> | null>(null);

  // Delete modal state
  const [deletingAnnounceId, setDeletingAnnounceId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load announcements
  useEffect(() => {
    async function loadAnnouncements() {
      setIsLoading(true);
      try {
        const res = await getAnnouncementsAction();
        if (res.success && res.announcements) {
          setAnnouncements(res.announcements as Announcement[]);
        } else {
          toast({
            title: "Failed to load announcements",
            description: res.error || "Please verify database connection.",
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
    loadAnnouncements();
  }, [toast]);

  // Submit form (add or edit)
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingAnnounce || !editingAnnounce.title || !editingAnnounce.content) return;

    startTransition(async () => {
      try {
        const res = await upsertAnnouncementAction({
          id: editingAnnounce.id,
          title: editingAnnounce.title || "",
          content: editingAnnounce.content || "",
          is_active: editingAnnounce.is_active !== undefined ? editingAnnounce.is_active : true,
        });

        if (res.success && res.announcement) {
          toast({
            title: "Success",
            description: `Announcement saved successfully.`,
            type: "success",
          });

          // Refresh list
          const saved = res.announcement as Announcement;
          if (editingAnnounce.id) {
            setAnnouncements((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
          } else {
            setAnnouncements((prev) => [saved, ...prev]);
          }
          setIsFormOpen(false);
          setEditingAnnounce(null);
        } else {
          toast({
            title: "Action failed",
            description: res.error || "Please check details.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Could not execute query.",
          type: "error",
        });
      }
    });
  }

  // Handle toggle is_active status
  async function handleToggleActive(announce: Announcement, value: boolean) {
    try {
      const res = await upsertAnnouncementAction({
        id: announce.id,
        title: announce.title,
        content: announce.content,
        is_active: value,
      });

      if (res.success) {
        toast({
          title: value ? "Banner activated" : "Banner deactivated",
          description: value ? "Notice will now show on user dashboard." : "Notice has been hidden.",
          type: "success",
        });

        setAnnouncements((prev) =>
          prev.map((a) => (a.id === announce.id ? { ...a, is_active: value } : a))
        );
      }
    } catch {
      toast({
        title: "Toggle failed",
        description: "Transaction failed.",
        type: "error",
      });
    }
  }

  // Confirm delete
  async function handleDeleteConfirm() {
    if (!deletingAnnounceId) return;

    startTransition(async () => {
      try {
        const res = await deleteAnnouncementAction(deletingAnnounceId);
        if (res.success) {
          toast({
            title: "Announcement deleted",
            description: "Entry deleted successfully.",
            type: "success",
          });
          setAnnouncements((prev) => prev.filter((a) => a.id !== deletingAnnounceId));
        } else {
          toast({
            title: "Delete failed",
            description: res.error || "Could not delete entry.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Could not complete operation.",
          type: "error",
        });
      } finally {
        setDeletingAnnounceId(null);
      }
    });
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Write global updates. Create announcements that appear on the user dashboard page as a header banner.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAnnounce({
              title: "",
              content: "",
              is_active: true,
            });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus size={14} />
          Create Banner
        </button>
      </div>

      {/* Announcements listing table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-neutral-500 font-medium">Fetching announcements list...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-16 text-center text-neutral-500 font-sans">
          No announcements created yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl max-w-4xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-6 w-1/4">Banner Title</th>
                  <th className="py-4.5 px-6 w-1/2">Content Notice</th>
                  <th className="py-4.5 px-6">Active</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Title */}
                    <td className="py-4 px-6 font-semibold text-white">
                      {a.title}
                    </td>

                    {/* Content notice */}
                    <td className="py-4 px-6 text-neutral-400 text-xs leading-relaxed max-w-sm truncate whitespace-normal">
                      {a.content}
                    </td>

                    {/* Active toggle check */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(a, !a.is_active)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          a.is_active 
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
                            : "text-neutral-500 hover:text-white border-transparent hover:bg-white/5"
                        } cursor-pointer`}
                        title={a.is_active ? "Deactivate Notice" : "Activate Notice"}
                      >
                        {a.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right shrink-0">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAnnounce(a);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg inline-flex cursor-pointer"
                          title="Edit Announcement"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingAnnounceId(a.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded-lg inline-flex cursor-pointer"
                          title="Delete Announcement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit modal Form */}
      {isFormOpen && editingAnnounce && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl overflow-hidden animate-scale-up">
            <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h3 className="font-display text-md font-bold flex items-center gap-2">
                <Megaphone className="text-indigo-400" size={16} />
                {editingAnnounce.id ? `Edit Announcement` : `Create Announcement`}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingAnnounce(null);
                }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-semibold text-neutral-400">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Maintenance"
                  value={editingAnnounce.title || ""}
                  onChange={(e) => setEditingAnnounce({ ...editingAnnounce, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-semibold text-neutral-400">Content message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the sitewide banner message here..."
                  value={editingAnnounce.content || ""}
                  onChange={(e) => setEditingAnnounce({ ...editingAnnounce, content: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50 leading-relaxed resize-none"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer select-none font-sans">
                <input
                  type="checkbox"
                  checked={editingAnnounce.is_active !== undefined ? editingAnnounce.is_active : true}
                  onChange={(e) => setEditingAnnounce({ ...editingAnnounce, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600"
                />
                <span>Instantly activate notice banner on save</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingAnnounce(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAnnounceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="text-red-400" size={20} />
              Delete Announcement
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Are you sure you want to delete this announcement? This banner will immediately disappear from the user application.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setDeletingAnnounceId(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all cursor-pointer"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
