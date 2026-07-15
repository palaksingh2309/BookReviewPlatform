"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  Tag, 
  Save, 
  X,
  AlertTriangle
} from "lucide-react";

import { 
  getGenresAction, 
  upsertGenreAction, 
  deleteGenreAction, 
  reorderGenresAction 
} from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface Genre {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export default function GenresCrudPage() {
  const { toast } = useToast();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Partial<Genre> | null>(null);

  // Delete modal state
  const [deletingGenreId, setDeletingGenreId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load genres
  useEffect(() => {
    async function loadGenres() {
      setIsLoading(true);
      try {
        const res = await getGenresAction();
        if (res.success && res.genres) {
          setGenres(res.genres as Genre[]);
        } else {
          toast({
            title: "Failed to load genres",
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
    loadGenres();
  }, [toast]);

  // Submit form (add or edit)
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingGenre || !editingGenre.name || !editingGenre.slug) return;

    startTransition(async () => {
      try {
        const order = editingGenre.display_order ?? (genres.length > 0 ? Math.max(...genres.map(g => g.display_order)) + 1 : 1);
        const res = await upsertGenreAction({
          id: editingGenre.id,
          name: editingGenre.name || "",
          slug: editingGenre.slug || "",
          display_order: order,
        });

        if (res.success && res.genre) {
          toast({
            title: "Success",
            description: `Genre "${editingGenre.name}" saved successfully.`,
            type: "success",
          });

          // Refresh list
          const saved = res.genre as Genre;
          if (editingGenre.id) {
            setGenres((prev) => prev.map((g) => (g.id === saved.id ? saved : g)).sort((a, b) => a.display_order - b.display_order));
          } else {
            setGenres((prev) => [...prev, saved].sort((a, b) => a.display_order - b.display_order));
          }
          setIsFormOpen(false);
          setEditingGenre(null);
        } else {
          toast({
            title: "Action failed",
            description: res.error || "Unique constraint block.",
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

  // Handle reorder move
  async function handleMove(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === genres.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...genres];
    
    // Swap display order properties
    const tempOrder = reordered[index].display_order;
    reordered[index].display_order = reordered[newIndex].display_order;
    reordered[newIndex].display_order = tempOrder;

    // Swap positions in array
    const tempItem = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = tempItem;

    // Set local state instantly for zero-latency UI response
    setGenres(reordered);

    // Save order changes to DB in background
    try {
      const updates = reordered.map((g) => ({ id: g.id, display_order: g.display_order }));
      const res = await reorderGenresAction(updates);
      if (!res.success) {
        toast({
          title: "Reorder save failed",
          description: res.error || "Please try again.",
          type: "error",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Reordering could not sync with database.",
        type: "error",
      });
    }
  }

  // Confirm delete genre
  async function handleDeleteConfirm() {
    if (!deletingGenreId) return;

    startTransition(async () => {
      try {
        const res = await deleteGenreAction(deletingGenreId);
        if (res.success) {
          toast({
            title: "Genre deleted",
            description: "Category removed from database.",
            type: "success",
          });
          setGenres((prev) => prev.filter((g) => g.id !== deletingGenreId));
        } else {
          toast({
            title: "Delete failed",
            description: res.error || "Could not delete genre.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Operation failed.",
          type: "error",
        });
      } finally {
        setDeletingGenreId(null);
      }
    });
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Genres & Categories</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configure catalog genres. Add new book categories, adjust display order, or delete active items.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGenre({
              name: "",
              slug: "",
              display_order: genres.length + 1,
            });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus size={14} />
          Create Genre
        </button>
      </div>

      {/* Genres table list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-neutral-500 font-medium">Fetching genres...</p>
        </div>
      ) : genres.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-16 text-center text-neutral-500 font-sans">
          No genres found in the database.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl max-w-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-6">Display Order</th>
                  <th className="py-4.5 px-6">Genre Name</th>
                  <th className="py-4.5 px-6">URL Slug</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {genres.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Display order index */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <span className="font-mono text-neutral-400 w-6 font-semibold">
                        {g.display_order}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="text-neutral-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer p-0.5 bg-white/5 rounded"
                          aria-label="Move Up"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          disabled={idx === genres.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="text-neutral-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer p-0.5 bg-white/5 rounded"
                          aria-label="Move Down"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6 font-semibold text-white">
                      {g.name}
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-6 font-mono text-xs text-neutral-500">
                      {g.slug}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right shrink-0">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => {
                            setEditingGenre(g);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg inline-flex cursor-pointer"
                          title="Edit Genre"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingGenreId(g.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded-lg inline-flex cursor-pointer"
                          title="Delete Genre"
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
      {isFormOpen && editingGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl overflow-hidden animate-scale-up">
            <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h3 className="font-display text-md font-bold flex items-center gap-2">
                <Tag className="text-indigo-400" size={16} />
                {editingGenre.id ? `Edit Genre` : `Create Genre`}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingGenre(null);
                }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-semibold text-neutral-400">Genre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fiction"
                  value={editingGenre.name || ""}
                  onChange={(e) => {
                    const slugVal = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    setEditingGenre({ ...editingGenre, name: e.target.value, slug: slugVal });
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-semibold text-neutral-400">URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="science-fiction"
                  value={editingGenre.slug || ""}
                  onChange={(e) => setEditingGenre({ ...editingGenre, slug: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50 font-mono"
                />
              </div>

              {/* Order */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-semibold text-neutral-400">Display Order index</label>
                <input
                  type="number"
                  required
                  value={editingGenre.display_order ?? genres.length + 1}
                  onChange={(e) => setEditingGenre({ ...editingGenre, display_order: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingGenre(null);
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
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Genre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGenreId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="text-red-400" size={20} />
              Delete Genre
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Are you sure you want to delete this genre? This will only remove the category definition itself. It will not delete books cataloged under it, but it might break category links.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setDeletingGenreId(null)}
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
