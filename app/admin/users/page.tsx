"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  UserMinus, 
  ShieldAlert, 
  Trash2, 
  Check, 
  UserCheck, 
  Loader2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

import { getUsersAction, updateUserAction, deleteUserAction } from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  favorite_genre: string | null;
  role: "user" | "moderator" | "admin";
  status: "active" | "suspended" | "banned";
  created_at: string;
}

export default function UsersModerationPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modals / Confirmation Drawer state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
    action: "suspend" | "ban" | "delete" | "promote-mod" | "promote-admin" | "demote" | "activate";
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load users when filter or search changes
  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const result = await getUsersAction({
          search,
          role,
          status,
          page: currentPage,
        });

        if (result.success && result.users) {
          setUsers(result.users as UserProfile[]);
          setTotalPages(result.totalPages || 1);
          setTotalCount(result.totalCount || 0);
        } else {
          toast({
            title: "Error loading users",
            description: result.error || "Please check database permissions.",
            type: "error",
          });
        }
      } catch (err) {
        toast({
          title: "Network error",
          description: "Could not establish database connection.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce search input
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, role, status, currentPage, toast]);

  // Handle pagination pages change
  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  // Trigger Action Execution
  function executeUserAction() {
    if (!confirmModal) return;

    const { userId, username, action } = confirmModal;

    startTransition(async () => {
      try {
        let res;
        if (action === "delete") {
          res = await deleteUserAction(userId);
        } else {
          let updates: { role?: "user" | "moderator" | "admin"; status?: "active" | "suspended" | "banned" } = {};
          if (action === "suspend") updates.status = "suspended";
          else if (action === "ban") updates.status = "banned";
          else if (action === "activate") updates.status = "active";
          else if (action === "promote-mod") updates.role = "moderator";
          else if (action === "promote-admin") updates.role = "admin";
          else if (action === "demote") updates.role = "user";

          res = await updateUserAction(userId, updates);
        }

        if (res.success) {
          toast({
            title: "Success",
            description: `User @${username} status has been updated.`,
            type: "success",
          });

          // Refresh user list local state
          if (action === "delete") {
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setTotalCount((c) => c - 1);
          } else {
            setUsers((prev) =>
              prev.map((u) => {
                if (u.id !== userId) return u;
                let updated = { ...u };
                if (action === "suspend") updated.status = "suspended";
                else if (action === "ban") updated.status = "banned";
                else if (action === "activate") updated.status = "active";
                else if (action === "promote-mod") updated.role = "moderator";
                else if (action === "promote-admin") updated.role = "admin";
                else if (action === "demote") updated.role = "user";
                return updated;
              })
            );
          }
        } else {
          toast({
            title: "Action failed",
            description: res.error || "Verify Supabase service role keys are configured.",
            type: "error",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Database transaction failed.",
          type: "error",
        });
      } finally {
        setConfirmModal(null);
      }
    });
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Users Moderation</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review subscriber credentials, promote roles, suspend accounts, or delete users.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by username or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20 placeholder:text-neutral-600"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none transition focus:border-indigo-400/50"
          >
            <option value="all" className="bg-neutral-900 text-white">All Roles</option>
            <option value="user" className="bg-neutral-900 text-white">Standard Users</option>
            <option value="moderator" className="bg-neutral-900 text-white">Moderators</option>
            <option value="admin" className="bg-neutral-900 text-white">Admins</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none transition focus:border-indigo-400/50"
          >
            <option value="all" className="bg-neutral-900 text-white">All Statuses</option>
            <option value="active" className="bg-neutral-900 text-white">Active Only</option>
            <option value="suspended" className="bg-neutral-900 text-white">Suspended Only</option>
            <option value="banned" className="bg-neutral-900 text-white">Banned Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-neutral-500 font-medium">Fetching member catalog...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-16 text-center text-neutral-500 font-sans">
          No users match the search terms or filter constraints.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-6">User details</th>
                  <th className="py-4.5 px-6">Role</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6">Registered</th>
                  <th className="py-4.5 px-6 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* User profile info */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">@{u.username}</p>
                        <p className="text-xs text-neutral-500 font-sans mt-0.5">{u.full_name || "No name set"}</p>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold capitalize ${
                        u.role === "admin" 
                          ? "bg-red-500/15 text-red-400 border border-red-500/25"
                          : u.role === "moderator"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                          : "bg-neutral-500/15 text-neutral-400 border border-neutral-500/25"
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold capitalize ${
                        u.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : u.status === "suspended"
                          ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                          : "bg-red-500/15 text-red-500 border border-red-500/25"
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${
                          u.status === "active" ? "bg-emerald-400" : u.status === "suspended" ? "bg-yellow-400" : "bg-red-400"
                        }`} />
                        {u.status}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="py-4 px-6 font-sans text-neutral-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right space-x-1.5 shrink-0">
                      {/* Promotes / Roles */}
                      {u.role === "user" ? (
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "promote-mod" })}
                          className="px-2 py-1.5 text-[10px] font-bold rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                        >
                          Mod
                        </button>
                      ) : u.role === "moderator" ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "promote-admin" })}
                            className="px-2 py-1.5 text-[10px] font-bold rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                          >
                            Admin
                          </button>
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "demote" })}
                            className="px-2 py-1.5 text-[10px] font-bold rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-neutral-400 hover:bg-neutral-600 hover:text-white transition-all cursor-pointer"
                          >
                            Demote
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "demote" })}
                          className="px-2 py-1.5 text-[10px] font-bold rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-neutral-400 hover:bg-neutral-600 hover:text-white transition-all cursor-pointer"
                        >
                          Demote
                        </button>
                      )}

                      {/* Status Locks */}
                      {u.status === "active" ? (
                        <>
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "suspend" })}
                            className="p-1.5 text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/10 rounded-lg inline-flex cursor-pointer"
                            title="Suspend Account"
                          >
                            <ShieldAlert size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "ban" })}
                            className="p-1.5 text-orange-400 hover:bg-orange-500/10 border border-orange-500/10 rounded-lg inline-flex cursor-pointer"
                            title="Ban Account"
                          >
                            <UserMinus size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "activate" })}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-lg inline-flex cursor-pointer"
                          title="Activate Account"
                        >
                          <UserCheck size={14} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, userId: u.id, username: u.username, action: "delete" })}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded-lg inline-flex cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 bg-white/2 px-6 py-4">
              <span className="text-xs text-neutral-500 font-sans">
                Showing Page {currentPage} of {totalPages} ({totalCount} total users)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal overlay */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 text-yellow-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Moderate User</h3>
            </div>
            
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Are you sure you want to <span className="font-bold text-white uppercase">{confirmModal.action.replace("-", " ")}</span> @{confirmModal.username}?
              {confirmModal.action === "delete" && (
                <span className="block text-xs text-red-400 mt-2 font-semibold">
                  WARNING: This will permanently delete their account credentials and library data from BookVerse.
                </span>
              )}
            </p>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeUserAction}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
