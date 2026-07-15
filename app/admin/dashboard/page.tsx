import React from "react";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  UserPlus, 
  ArrowRight,
  TrendingUp
} from "lucide-react";

import { getDashboardStatsAction } from "../../../actions/admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const result = await getDashboardStatsAction();

  if (!result.success || !result.stats) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-200">
        <h2 className="text-lg font-bold">Failed to load dashboard</h2>
        <p className="mt-2 text-sm">{result.error || "Please verify your database connection."}</p>
      </div>
    );
  }

  const { stats, recentActivity, pendingReports } = result;

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: `+${stats.newUsers} this week`,
      icon: Users,
      color: "from-indigo-600 to-indigo-500",
      textColor: "text-indigo-400",
      sparkline: [20, 30, 45, 35, 55, 75, 90],
    },
    {
      title: "Total Books",
      value: stats.totalBooks,
      change: "Sync with Google API",
      icon: BookOpen,
      color: "from-pink-600 to-pink-500",
      textColor: "text-pink-400",
      sparkline: [40, 50, 45, 60, 55, 70, 85],
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      change: "Active user ratings",
      icon: MessageSquare,
      color: "from-amber-600 to-amber-500",
      textColor: "text-amber-400",
      sparkline: [15, 25, 35, 50, 40, 65, 80],
    },
    {
      title: "Community Posts",
      value: stats.totalPosts,
      change: "Social feed items",
      icon: FileText,
      color: "from-emerald-600 to-emerald-500",
      textColor: "text-emerald-400",
      sparkline: [30, 20, 40, 35, 60, 50, 75],
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time operations status and general sitewide engagement summary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            System Live
          </span>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          // Render a simple beautiful SVG path for the sparkline chart
          const maxVal = Math.max(...card.sparkline);
          const minVal = Math.min(...card.sparkline);
          const range = maxVal - minVal || 1;
          const points = card.sparkline
            .map((val, i) => `${(i / (card.sparkline.length - 1)) * 100},${40 - ((val - minVal) / range) * 30}`)
            .join(" ");

          return (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between group hover:border-white/20 transition-all duration-300 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-400">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-white/5 ${card.textColor} group-hover:bg-white/10 transition-colors`}>
                  <Icon size={18} />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight">
                  {card.value.toLocaleString()}
                </span>
                <p className="text-xs text-neutral-500 font-semibold mt-1">
                  {card.change}
                </p>
              </div>

              {/* Sparkline chart */}
              <div className="h-10 w-full mt-4">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.textColor.includes("indigo") ? "#a32c3f" : card.textColor.includes("pink") ? "#a6701e" : "#556b2f"} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={card.textColor.includes("indigo") ? "#a32c3f" : card.textColor.includes("pink") ? "#a6701e" : "#556b2f"} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Filled area */}
                  <path
                    d={`M 0,40 L ${points} L 100,40 Z`}
                    fill={`url(#grad-${idx})`}
                  />
                  {/* Glowing line */}
                  <polyline
                    fill="none"
                    stroke={card.textColor.includes("indigo") ? "#a32c3f" : card.textColor.includes("pink") ? "#a6701e" : "#556b2f"}
                    strokeWidth="2"
                    points={points}
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Pending Moderation & Recent activity */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (2/3 width) - Pending Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="text-indigo-400" size={20} />
              Pending Reports
              {stats.pendingReports > 0 && (
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-400 ring-1 ring-indigo-400/20">
                  {stats.pendingReports} urgent
                </span>
              )}
            </h2>
            <Link
              href="/admin/reports"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              Moderate Center
              <ArrowRight size={14} />
            </Link>
          </div>

          {pendingReports.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/2 p-12 text-center text-neutral-500 font-sans">
              No pending flags or reports. The catalog and feed are clean!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report: any) => (
                <div
                  key={report.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start justify-between gap-4 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {report.content_type}
                      </span>
                      <span className="text-xs text-neutral-500 font-semibold font-mono">
                        ID: {report.content_id.substring(0, 8)}...
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white mt-2">
                      Reason: <span className="font-normal text-neutral-300 font-sans">"{report.reason}"</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 font-sans">
                      Reported user: @{report.reported_user?.username || "unknown"} • Reporter: @{report.reporter?.username || "unknown"}
                    </p>
                  </div>
                  <Link
                    href={`/admin/reports?id=${report.id}`}
                    className="shrink-0 text-xs font-semibold text-indigo-400 hover:text-white px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 transition-all border border-indigo-500/20 hover:border-transparent cursor-pointer"
                  >
                    Moderate
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1/3 width) - Recent Activity Timeline */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-pink-400" size={20} />
              Recent Activity
            </h2>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10 font-sans">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-6">No recent events recorded.</p>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline point */}
                  <span className="absolute -left-[20px] top-1.5 h-3.5 w-3.5 rounded-full bg-neutral-900 border-2 border-indigo-400 scale-100 group-hover:scale-125 transition-transform duration-200" />
                  
                  <div>
                    <p className="text-xs text-neutral-500 font-semibold font-mono">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {" • "}
                      {new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-neutral-300 mt-1 font-sans leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
