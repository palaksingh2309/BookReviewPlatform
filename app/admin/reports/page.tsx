"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { 
  AlertTriangle, 
  Check, 
  Trash2, 
  UserX, 
  ShieldCheck, 
  Loader2,
  Search,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Eye
} from "lucide-react";

import { getReportsAction, resolveReportAction } from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface Report {
  id: string;
  reporter_id: string | null;
  reported_user_id: string;
  content_type: "post" | "review" | "comment" | "user";
  content_id: string;
  reason: string;
  status: "pending" | "resolved" | "ignored";
  created_at: string;
  reporter?: { username: string } | null;
  reported_user?: { username: string } | null;
}

export default function ReportsModerationPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const reportIdParam = searchParams.get("id");

  const [reports, setReports] = useState<Report[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Selected report for action
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [deleteContent, setDeleteContent] = useState(true);
  const [suspendUser, setSuspendUser] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Load reports
  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const result = await getReportsAction({
          status: statusFilter as any,
          contentType: typeFilter,
          page: currentPage,
        });

        if (result.success && result.reports) {
          setReports(result.reports as Report[]);
          setTotalPages(result.totalPages || 1);
          setTotalCount(result.totalCount || 0);

          // If a query parameter report ID was passed, focus it
          if (reportIdParam) {
            const found = (result.reports as Report[]).find(r => r.id === reportIdParam);
            if (found) {
              setActiveReport(found);
            }
          }
        } else {
          toast({
            title: "Failed to load reports",
            description: result.error || "Please verify database connection.",
            type: "error",
          });
        }
      } catch (err) {
        toast({
          title: "Network error",
          description: "Database is unreachable.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, [statusFilter, typeFilter, currentPage, reportIdParam, toast]);

  // Handle page changes
  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  // Submit resolve/ignore actions
  function handleResolve(actionType: "resolved" | "ignored") {
    if (!activeReport) return;

    startTransition(async () => {
      try {
        const res = await resolveReportAction(activeReport.id, actionType, {
          deleteContent: actionType === "resolved" ? deleteContent : false,
          suspendUser: actionType === "resolved" ? suspendUser : false,
          contentType: activeReport.content_type,
          contentId: activeReport.content_id,
          reportedUserId: activeReport.reported_user_id,
        });

        if (res.success) {
          toast({
            title: actionType === "resolved" ? "Report Resolved" : "Report Ignored",
            description: `The report has been resolved. Action details applied.`,
            type: "success",
          });

          // Update local state
          setReports((prev) =>
            prev.map((r) => (r.id === activeReport.id ? { ...r, status: actionType } : r))
          );
        } else {
          toast({
            title: "Action failed",
            description: res.error || "Please try again.",
            type: "error",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          type: "error",
        });
      } finally {
        setActiveReport(null);
        setSuspendUser(false);
        setDeleteContent(true);
      }
    });
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Reports Center</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review, approve, ignore, or moderate items flagged by BookVerse users.
        </p>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-indigo-400" />
          <span className="text-xs font-semibold text-neutral-400">Moderation Inbox</span>
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none focus:border-indigo-400/50"
          >
            <option value="all" className="bg-neutral-900 text-white">All States</option>
            <option value="pending" className="bg-neutral-900 text-white">Pending</option>
            <option value="resolved" className="bg-neutral-900 text-white">Resolved</option>
            <option value="ignored" className="bg-neutral-900 text-white">Ignored</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none focus:border-indigo-400/50"
          >
            <option value="all" className="bg-neutral-900 text-white">All Types</option>
            <option value="post" className="bg-neutral-900 text-white">Community Posts</option>
            <option value="review" className="bg-neutral-900 text-white">Book Reviews</option>
            <option value="comment" className="bg-neutral-900 text-white">Comments</option>
            <option value="user" className="bg-neutral-900 text-white">User Accounts</option>
          </select>
        </div>
      </div>

      {/* Reports listing table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-neutral-500 font-medium">Fetching reports inbox...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-16 text-center text-neutral-500 font-sans">
          No reports found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-6">Flagged Item</th>
                  <th className="py-4.5 px-6">Reporter</th>
                  <th className="py-4.5 px-6">Offender</th>
                  <th className="py-4.5 px-6 w-80">Reason</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((r) => (
                  <tr key={r.id} className={`hover:bg-white/[0.02] transition-colors ${
                    reportIdParam === r.id ? "bg-indigo-600/5 ring-1 ring-indigo-500/20" : ""
                  }`}>
                    {/* Content ID / Type */}
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {r.content_type}
                      </span>
                      <p className="text-xs text-neutral-500 font-mono mt-1">ID: {r.content_id.substring(0, 8)}...</p>
                    </td>

                    {/* Reporter */}
                    <td className="py-4 px-6 font-semibold">
                      @{r.reporter?.username || "anonymous"}
                    </td>

                    {/* Reported user */}
                    <td className="py-4 px-6 font-semibold">
                      @{r.reported_user?.username || "unknown"}
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-6 font-sans text-xs text-neutral-400 leading-relaxed max-w-xs truncate whitespace-normal">
                      "{r.reason}"
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold capitalize ${
                        r.status === "pending"
                          ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                          : r.status === "resolved"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-neutral-500/15 text-neutral-400 border border-neutral-500/25"
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${
                          r.status === "pending" ? "bg-yellow-400" : r.status === "resolved" ? "bg-emerald-400" : "bg-neutral-400"
                        }`} />
                        {r.status}
                      </span>
                    </td>

                    {/* Moderation Button */}
                    <td className="py-4 px-6 text-right shrink-0">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => setActiveReport(r)}
                          className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-500 font-sans italic">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 bg-white/2 px-6 py-4">
              <span className="text-xs text-neutral-500 font-sans">
                Showing Page {currentPage} of {totalPages} ({totalCount} total reports)
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

      {/* Resolution Dialog modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl overflow-hidden animate-scale-up space-y-6">
            <div className="flex items-center gap-3 text-indigo-400 pb-2 border-b border-white/5">
              <AlertTriangle size={22} />
              <h3 className="text-lg font-bold text-white">Resolve Moderation Report</h3>
            </div>

            <div className="space-y-3 font-sans">
              <p className="text-sm text-neutral-300">
                You are moderating a <span className="font-bold text-white uppercase">{activeReport.content_type}</span> flagged for:
              </p>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs font-medium italic text-neutral-400">
                "{activeReport.reason}"
              </div>
              <p className="text-xs text-neutral-500">
                Reported offender: <span className="font-semibold text-white">@{activeReport.reported_user?.username || "unknown"}</span>
              </p>
            </div>

            {/* Actions Checkboxes */}
            <div className="space-y-3 font-sans border-t border-white/5 pt-4">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Select Actions:</p>
              
              {activeReport.content_type !== "user" && (
                <label className="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteContent}
                    onChange={(e) => setDeleteContent(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600"
                  />
                  <span>Delete reported content ({activeReport.content_type})</span>
                </label>
              )}

              <label className="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={suspendUser}
                  onChange={(e) => setSuspendUser(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600"
                />
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <UserX size={14} />
                  Suspend reported user account (@{activeReport.reported_user?.username || "unknown"})
                </span>
              </label>
            </div>

            {/* Resolve submit buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
              <button
                onClick={() => {
                  setActiveReport(null);
                  setSuspendUser(false);
                  setDeleteContent(true);
                }}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleResolve("ignored")}
                disabled={isPending}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                Ignore Report
              </button>

              <button
                onClick={() => handleResolve("resolved")}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply & Settle"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
