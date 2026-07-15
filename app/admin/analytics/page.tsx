"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Loader2,
  Calendar
} from "lucide-react";

import { getAnalyticsDataAction } from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface GrowthData {
  month: string;
  users: number;
}

interface ReviewData {
  month: string;
  reviews: number;
  ratingsAvg: number;
}

interface EngagementData {
  month: string;
  posts: number;
  likes: number;
  comments: number;
}

interface BookData {
  title: string;
  reviews_count: number;
  rating: number;
}

interface GenreData {
  name: string;
  value: number;
}

export default function AnalyticsDashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [growth, setGrowth] = useState<GrowthData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [engagement, setEngagement] = useState<EngagementData[]>([]);
  const [popularBooks, setPopularBooks] = useState<BookData[]>([]);
  const [popularGenres, setPopularGenres] = useState<GenreData[]>([]);

  // Tooltip hover states
  const [activeTooltip, setActiveTooltip] = useState<{
    chartId: string;
    index: number;
    x: number;
    y: number;
    content: React.ReactNode;
  } | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const res = await getAnalyticsDataAction();
        if (res.success) {
          setGrowth(res.userGrowth || []);
          setReviews(res.reviewActivity || []);
          setEngagement(res.engagement || []);
          setPopularBooks(res.popularBooks || []);
          setPopularGenres(res.popularGenres || []);
        } else {
          toast({
            title: "Analytics error",
            description: res.error || "Please verify database schema.",
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

    loadAnalytics();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm text-neutral-500 font-medium">Compiling analytics reports...</p>
      </div>
    );
  }

  // Helper colors mapping
  const colors = ["#8c1b2f", "#a6701e", "#556b2f", "#5c4033", "#c8a97e"];

  // 1. Calculations for Area Chart (User Growth)
  const maxGrowthVal = Math.max(...growth.map(g => g.users), 100);
  const growthPoints = growth
    .map((g, i) => `${(i / (growth.length - 1)) * 400 + 50},${170 - (g.users / maxGrowthVal) * 120}`)
    .join(" ");

  // 2. Calculations for Line Chart (Review Activity)
  const maxReviewsVal = Math.max(...reviews.map(r => r.reviews), 100);
  const reviewPoints = reviews
    .map((r, i) => `${(i / (reviews.length - 1)) * 400 + 50},${170 - (r.reviews / maxReviewsVal) * 120}`)
    .join(" ");

  // 3. Calculations for Bar Chart (Engagement)
  const maxEngagementVal = Math.max(...engagement.map(e => Math.max(e.posts, e.comments, e.likes / 10)), 50);

  // 4. Calculations for Donut Chart (Genres)
  const totalGenreCount = popularGenres.reduce((acc, curr) => acc + curr.value, 0);
  let accumulatedAngle = 0;

  return (
    <div className="space-y-10 animate-fade-in font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Analytics & Insights</h1>
          <p className="text-sm text-neutral-400 mt-1">
            System performance, user growth velocity, review rate, and catalog category breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-semibold text-neutral-400">
          <Calendar size={14} className="text-indigo-400" />
          Last 6 Months
        </div>
      </div>

      {/* Grid of Interactive SVG Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth (Area Chart) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md relative">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <Users size={16} className="text-indigo-400" />
            User Growth velocity
          </h2>

          <div className="h-60 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a32c3f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a32c3f" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3].map((yIdx) => (
                <line
                  key={yIdx}
                  x1="50"
                  y1={50 + yIdx * 40}
                  x2="450"
                  y2={50 + yIdx * 40}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Y Axis Labels */}
              <text x="15" y="55" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                {Math.round(maxGrowthVal).toLocaleString()}
              </text>
              <text x="15" y="115" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                {Math.round(maxGrowthVal / 2).toLocaleString()}
              </text>
              <text x="15" y="175" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                0
              </text>

              {/* Filled area */}
              {growth.length > 0 && (
                <path
                  d={`M 50,170 L ${growthPoints} L 450,170 Z`}
                  fill="url(#growthGrad)"
                />
              )}

              {/* Glowing Line */}
              {growth.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#a32c3f"
                  strokeWidth="2"
                  points={growthPoints}
                />
              )}

              {/* Interactive Points */}
              {growth.map((g, idx) => {
                const xVal = (idx / (growth.length - 1)) * 400 + 50;
                const yVal = 170 - (g.users / maxGrowthVal) * 120;
                return (
                  <g key={idx}>
                    <circle
                      cx={xVal}
                      cy={yVal}
                      r="4"
                      fill="#a32c3f"
                      stroke="#120707"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={(e) => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        setActiveTooltip({
                          chartId: "growth",
                          index: idx,
                          x: bounds.left - 50,
                          y: bounds.top - 80,
                          content: (
                            <div>
                              <p className="text-[10px] font-bold text-neutral-500 uppercase">{g.month}</p>
                              <p className="text-sm font-extrabold text-white mt-0.5">{g.users} users</p>
                            </div>
                          ),
                        });
                      }}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />
                    <text x={xVal - 10} y="190" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">
                      {g.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Review Activity (Line Chart) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md relative">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <MessageSquare size={16} className="text-pink-400" />
            Monthly Book Reviews rate
          </h2>

          <div className="h-60 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a6701e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a6701e" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3].map((yIdx) => (
                <line
                  key={yIdx}
                  x1="50"
                  y1={50 + yIdx * 40}
                  x2="450"
                  y2={50 + yIdx * 40}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Y Axis Labels */}
              <text x="15" y="55" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                {Math.round(maxReviewsVal).toLocaleString()}
              </text>
              <text x="15" y="115" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                {Math.round(maxReviewsVal / 2).toLocaleString()}
              </text>
              <text x="15" y="175" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                0
              </text>

              {/* Filled area */}
              {reviews.length > 0 && (
                <path
                  d={`M 50,170 L ${reviewPoints} L 450,170 Z`}
                  fill="url(#reviewGrad)"
                />
              )}

              {/* Line */}
              {reviews.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#a6701e"
                  strokeWidth="2"
                  points={reviewPoints}
                />
              )}

              {/* Interactive points */}
              {reviews.map((r, idx) => {
                const xVal = (idx / (reviews.length - 1)) * 400 + 50;
                const yVal = 170 - (r.reviews / maxReviewsVal) * 120;
                return (
                  <g key={idx}>
                    <circle
                      cx={xVal}
                      cy={yVal}
                      r="4"
                      fill="#a6701e"
                      stroke="#120707"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6"
                      onMouseEnter={(e) => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        setActiveTooltip({
                          chartId: "reviews",
                          index: idx,
                          x: bounds.left - 50,
                          y: bounds.top - 80,
                          content: (
                            <div>
                              <p className="text-[10px] font-bold text-neutral-500 uppercase">{r.month}</p>
                              <p className="text-sm font-extrabold text-white mt-0.5">{r.reviews} reviews</p>
                              <p className="text-[10px] text-neutral-400 mt-1">Rating: {r.ratingsAvg} ★ avg</p>
                            </div>
                          ),
                        });
                      }}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />
                    <text x={xVal - 10} y="190" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">
                      {r.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Community Engagement (Bar Chart) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md relative">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <FileText size={16} className="text-emerald-400" />
            Social Engagement metrics
          </h2>

          <div className="h-60 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 200">
              {/* Grid Lines */}
              {[0, 1, 2, 3].map((yIdx) => (
                <line
                  key={yIdx}
                  x1="50"
                  y1={50 + yIdx * 40}
                  x2="450"
                  y2={50 + yIdx * 40}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Y Axis labels */}
              <text x="15" y="55" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                {Math.round(maxEngagementVal).toLocaleString()}
              </text>
              <text x="15" y="115" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                {Math.round(maxEngagementVal / 2).toLocaleString()}
              </text>
              <text x="15" y="175" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">
                0
              </text>

              {/* Render Bars */}
              {engagement.map((e, idx) => {
                const groupWidth = 400 / engagement.length;
                const startX = 50 + idx * groupWidth + (groupWidth - 30) / 2;

                const postHeight = (e.posts / maxEngagementVal) * 120;
                const commentHeight = (e.comments / maxEngagementVal) * 120;

                return (
                  <g key={idx}>
                    {/* Posts Bar */}
                    <rect
                      x={startX}
                      y={170 - postHeight}
                      width="12"
                      height={postHeight}
                      fill="#a32c3f"
                      rx="3"
                      className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                      onMouseEnter={(ev) => {
                        const bounds = ev.currentTarget.getBoundingClientRect();
                        setActiveTooltip({
                          chartId: "engagement",
                          index: idx,
                          x: bounds.left - 50,
                          y: bounds.top - 80,
                          content: (
                            <div>
                              <p className="text-[10px] font-bold text-neutral-500 uppercase">{e.month}</p>
                              <p className="text-xs text-white mt-1">Posts: <span className="font-bold">{e.posts}</span></p>
                              <p className="text-xs text-neutral-400">Likes: {e.likes}</p>
                            </div>
                          ),
                        });
                      }}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />

                    {/* Comments Bar */}
                    <rect
                      x={startX + 14}
                      y={170 - commentHeight}
                      width="12"
                      height={commentHeight}
                      fill="#a6701e"
                      rx="3"
                      className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                      onMouseEnter={(ev) => {
                        const bounds = ev.currentTarget.getBoundingClientRect();
                        setActiveTooltip({
                          chartId: "engagement",
                          index: idx,
                          x: bounds.left - 50,
                          y: bounds.top - 80,
                          content: (
                            <div>
                              <p className="text-[10px] font-bold text-neutral-500 uppercase">{e.month}</p>
                              <p className="text-xs text-white mt-1">Comments: <span className="font-bold">{e.comments}</span></p>
                              <p className="text-xs text-neutral-400">Likes: {e.likes}</p>
                            </div>
                          ),
                        });
                      }}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />

                    {/* Month Label */}
                    <text x={startX + 2} y="190" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">
                      {e.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex gap-4 justify-center mt-2 text-xs font-semibold text-neutral-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-indigo-500" /> Posts</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-pink-500" /> Comments</span>
          </div>
        </div>

        {/* Popular Genres (Donut Chart) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md relative">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <BookOpen size={16} className="text-amber-400" />
            Popular Genres distribution
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-60">
            {/* SVG Donut */}
            <div className="relative h-40 w-40 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="12"
                />

                {popularGenres.map((g, idx) => {
                  const percentage = (g.value / totalGenreCount) * 100;
                  const strokeDasharray = 2 * Math.PI * 45; // ~282.74
                  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
                  const currentAngle = accumulatedAngle;
                  accumulatedAngle += percentage;

                  const color = colors[idx % colors.length];

                  return (
                    <circle
                      key={g.name}
                      cx="60"
                      cy="60"
                      r="45"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      style={{
                        transformOrigin: "60px 60px",
                        transform: `rotate(${(currentAngle / 100) * 360}deg)`,
                      }}
                      className="cursor-pointer opacity-90 hover:opacity-100 hover:stroke-[14px] transition-all"
                      onMouseEnter={(e) => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        setActiveTooltip({
                          chartId: "genres",
                          index: idx,
                          x: bounds.left - 50,
                          y: bounds.top - 80,
                          content: (
                            <div>
                              <p className="text-sm font-extrabold text-white">{g.name}</p>
                              <p className="text-xs text-neutral-400 mt-0.5">{g.value} books ({percentage.toFixed(1)}%)</p>
                            </div>
                          ),
                        });
                      }}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total</span>
                <span className="text-lg font-black text-white mt-0.5">{totalGenreCount}</span>
              </div>
            </div>

            {/* List labels */}
            <div className="space-y-2.5 flex-1 w-full font-sans">
              {popularGenres.map((g, idx) => {
                const percentage = (g.value / totalGenreCount) * 100;
                const color = colors[idx % colors.length];
                return (
                  <div key={g.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-neutral-300 font-semibold truncate max-w-[120px]">
                      <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                      {g.name}
                    </span>
                    <span className="text-neutral-500 font-bold">
                      {g.value} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Books Row (Horizontal Bar List) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md max-w-4xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
          <BarChart3 size={16} className="text-pink-400" />
          Popular Volumes (by review volume)
        </h2>

        <div className="space-y-4 font-sans">
          {popularBooks.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No popular books stats. Complete reviews to populate.</p>
          ) : (
            popularBooks.map((b, idx) => {
              const maxReviewsCount = Math.max(...popularBooks.map(bk => bk.reviews_count), 1);
              const pct = (b.reviews_count / maxReviewsCount) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-200 truncate max-w-xs">{b.title} ({b.rating} ★)</span>
                    <span className="text-neutral-500 font-mono">{b.reviews_count} reviews</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-700 to-indigo-500 border border-indigo-400/20"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Global Interactive Hover Tooltip */}
      {activeTooltip && (
        <div
          className="fixed z-9999 pointer-events-none rounded-xl border border-white/10 bg-neutral-900/90 backdrop-blur-md p-3 shadow-2xl animate-fade-in"
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y}px`,
          }}
        >
          {activeTooltip.content}
        </div>
      )}
    </div>
  );
}
