import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import toast from "react-hot-toast";
import { API_ANALYTICS } from "../utils/apiPaths";

// Animated counter hook
const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

// Relative time formatter
const timeAgo = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const AnalyticsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_ANALYTICS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast.error("Could not load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  // Animated counters
  const totalBooks = useCountUp(data?.totalBooks || 0);
  const publishedBooks = useCountUp(data?.publishedBooks || 0);
  const draftBooks = useCountUp(data?.draftBooks || 0);
  const totalWords = useCountUp(data?.totalWords || 0);
  const totalReads = useCountUp(data?.totalReads || 0);
  const totalChapters = useCountUp(data?.totalChapters || 0);

  // Heatmap helpers
  const getHeatmapColor = (count) => {
    if (count === 0) return "var(--color-bg-tertiary)";
    if (count === 1) return "rgba(139,92,246,0.25)";
    if (count === 2) return "rgba(139,92,246,0.45)";
    if (count === 3) return "rgba(139,92,246,0.65)";
    return "rgba(139,92,246,0.9)";
  };

  const formatNumber = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  // Build heatmap grid (26 weeks × 7 days)
  const buildHeatmapGrid = () => {
    if (!data?.heatmapData) return [];
    const dateMap = {};
    data.heatmapData.forEach((d) => { dateMap[d.date] = d.count; });

    const today = new Date();
    const dayOfWeek = today.getDay();
    // Start from 26 weeks ago, aligned to Sunday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (26 * 7) - dayOfWeek);

    const weeks = [];
    let current = new Date(startDate);
    for (let w = 0; w < 27; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        const isFuture = current > today;
        week.push({
          date: dateStr,
          count: isFuture ? -1 : (dateMap[dateStr] || 0),
          dayOfWeek: d,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const heatmapGrid = buildHeatmapGrid();

  // Category distribution
  const categoryEntries = data?.categoryDistribution
    ? Object.entries(data.categoryDistribution).sort((a, b) => b[1] - a[1])
    : [];
  const maxCategoryCount = categoryEntries.length > 0 ? categoryEntries[0][1] : 1;

  const categoryColors = [
    "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899",
    "#6366F1", "#14B8A6", "#F97316", "#84CC16",
  ];

  // AI usage
  const aiUsed = data?.aiGenerationsUsed || 0;
  const aiLimit = data?.aiGenerationLimit || 5;
  const aiPercent = aiLimit === -1 ? 0 : Math.min(100, (aiUsed / aiLimit) * 100);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
          <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="text-base font-display font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
              📊 Writer Analytics
            </span>
            <span className="text-[8px] font-bold tracking-widest text-text-muted uppercase bg-bg-tertiary px-2 py-0.5 rounded-full border border-border-primary">
              Insights
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              to="/dashboard"
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors border border-border-primary hover:border-text-primary px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="text-[10px] font-bold uppercase tracking-wider text-accent-primary hover:text-accent-hover transition-colors border border-accent-ring hover:border-accent-primary px-3 py-1.5 rounded-lg cursor-pointer bg-accent-primary/10"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors border border-border-primary hover:border-text-primary px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="font-display font-light text-3xl sm:text-4xl text-text-primary tracking-tight mb-1.5">
            Your Writing <span className="font-normal">Insights</span> ✨
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm font-medium leading-relaxed">
            Track your creative output, AI usage, and publishing milestones.
          </p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total Books", value: totalBooks, icon: "📚", color: "#8B5CF6" },
            { label: "Published", value: publishedBooks, icon: "🚀", color: "#10B981" },
            { label: "Drafts", value: draftBooks, icon: "📝", color: "#F59E0B" },
            { label: "Total Words", value: formatNumber(data?.totalWords || 0), icon: "✍️", color: "#3B82F6", raw: true },
            { label: "Chapters", value: totalChapters, icon: "📑", color: "#EC4899" },
            { label: "Total Reads", value: formatNumber(data?.totalReads || 0), icon: "👁️", color: "#6366F1", raw: true },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-bg-secondary border border-border-primary rounded-xl p-4 hover:border-accent-primary/40 transition-all group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3 transition-transform group-hover:scale-110"
                style={{ background: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <p className="text-2xl font-display font-semibold text-text-primary tracking-tight">
                {stat.raw ? stat.value : stat.value}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Writing Activity Heatmap — 2 cols */}
          <div className="lg:col-span-2 bg-bg-secondary border border-border-primary rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-semibold text-text-primary">Writing Activity</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Last 6 months of creative work</p>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] text-text-muted">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((l) => (
                  <div
                    key={l}
                    className="w-2.5 h-2.5 rounded-[3px]"
                    style={{ background: getHeatmapColor(l) }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Month labels */}
            <div className="flex gap-0 mb-1 pl-7" style={{ width: "fit-content" }}>
              {(() => {
                const months = [];
                const today = new Date();
                for (let i = 6; i >= 0; i--) {
                  const d = new Date(today);
                  d.setMonth(d.getMonth() - i);
                  months.push(d.toLocaleString("default", { month: "short" }));
                }
                const uniqueMonths = [...new Set(months)];
                const width = (27 * 14) / uniqueMonths.length;
                return uniqueMonths.map((m, i) => (
                  <span key={m + i} className="text-[8px] text-text-muted font-mono" style={{ width: `${width}px` }}>
                    {m}
                  </span>
                ));
              })()}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-0.5 overflow-x-auto pb-2 relative">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
                  <div key={i} className="h-[11px] flex items-center">
                    <span className="text-[7px] text-text-muted font-mono w-5 text-right">{day}</span>
                  </div>
                ))}
              </div>
              {heatmapGrid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((cell, di) => (
                    <div
                      key={`${wi}-${di}`}
                      className="w-[11px] h-[11px] rounded-[3px] transition-all duration-150 cursor-pointer relative"
                      style={{
                        background: cell.count === -1 ? "transparent" : getHeatmapColor(cell.count),
                        border: cell.count === -1 ? "none" : undefined,
                        opacity: cell.count === -1 ? 0 : 1,
                      }}
                      onMouseEnter={() => cell.count >= 0 && setHoveredCell({ ...cell, wi, di })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {hoveredCell?.wi === wi && hoveredCell?.di === di && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-bg-primary border border-border-primary rounded-lg px-2 py-1 shadow-lg z-50 whitespace-nowrap pointer-events-none">
                          <p className="text-[8px] font-bold text-text-primary">
                            {cell.count} {cell.count === 1 ? "activity" : "activities"}
                          </p>
                          <p className="text-[7px] text-text-muted">{cell.date}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* AI Usage Tracker — 1 col */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-semibold text-text-primary">AI Usage</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Total AI Generation requests</p>
              </div>
              <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-accent-primary/10 text-accent-primary border-accent-primary/20">
                ACTIVE
              </span>
            </div>

            {/* Big number */}
            <div className="text-center my-4 flex-1 flex flex-col items-center justify-center">
              <p className="text-5xl font-display font-bold text-accent-primary tracking-tight">{aiUsed}</p>
              <p className="text-[10px] text-text-muted mt-1 font-semibold">
                Total AI generations utilized
              </p>
            </div>
          </div>
        </div>


        {/* Second Row: Category Distribution + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Distribution */}
          <div className="lg:col-span-2 bg-bg-secondary border border-border-primary rounded-xl p-5">
            <h3 className="text-sm font-display font-semibold text-text-primary mb-1">Genre Distribution</h3>
            <p className="text-[10px] text-text-muted mb-5">Books breakdown by category</p>

            {categoryEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted text-xs">No books yet. Create your first book to see distribution.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {categoryEntries.map(([cat, count], i) => {
                  const percent = Math.round((count / (data?.totalBooks || 1)) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-text-primary truncate max-w-[200px]">{cat}</span>
                        <span className="text-[9px] font-mono text-text-muted ml-2">
                          {count} {count === 1 ? "book" : "books"} · {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${(count / maxCategoryCount) * 100}%`,
                            background: categoryColors[i % categoryColors.length],
                            animationDelay: `${i * 150}ms`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
            <h3 className="text-sm font-display font-semibold text-text-primary mb-1">Quick Stats</h3>
            <p className="text-[10px] text-text-muted mb-5">Key writing metrics</p>

            <div className="flex flex-col gap-4">
              {[
                {
                  label: "Avg Words/Chapter",
                  value: formatNumber(data?.avgWordsPerChapter || 0),
                  icon: "📏",
                  color: "#3B82F6",
                },
                {
                  label: "Most Active Day",
                  value: data?.mostActiveDay || "—",
                  icon: "🔥",
                  color: "#F59E0B",
                },
                {
                  label: "Longest Book",
                  value: data?.longestBook?.title
                    ? `${data.longestBook.title.substring(0, 18)}${data.longestBook.title.length > 18 ? "..." : ""}`
                    : "—",
                  sub: data?.longestBook?.wordCount ? `${formatNumber(data.longestBook.wordCount)} words` : "",
                  icon: "📖",
                  color: "#10B981",
                },
                {
                  label: "Total Chapters",
                  value: data?.totalChapters || 0,
                  icon: "📑",
                  color: "#EC4899",
                },
                {
                  label: "Writing Streak",
                  value: `${user?.streak || 0} days`,
                  icon: "⚡",
                  color: "#8B5CF6",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 group">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `${stat.color}12`, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{stat.value}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-muted">{stat.label}</p>
                    {stat.sub && (
                      <p className="text-[8px] text-text-muted font-mono">{stat.sub}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 mb-8">
          <h3 className="text-sm font-display font-semibold text-text-primary mb-1">Recent Activity</h3>
          <p className="text-[10px] text-text-muted mb-5">Your latest writing milestones</p>

          {(!data?.recentActivity || data.recentActivity.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-text-muted text-xs">No activity yet. Start creating eBooks to see your timeline.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-border-primary rounded-full" />

              <div className="flex flex-col gap-0">
                {data.recentActivity.map((event, i) => (
                  <div key={i} className="flex items-start gap-4 relative group py-3">
                    {/* Dot */}
                    <div
                      className="w-[9px] h-[9px] rounded-full flex-shrink-0 mt-1 relative z-10 ring-3 ring-bg-secondary transition-transform group-hover:scale-125"
                      style={{
                        background: event.type === "created" ? "#10B981" : "#8B5CF6",
                      }}
                    />
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            event.type === "created"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                          }`}
                        >
                          {event.type === "created" ? "Created" : "Updated"}
                        </span>
                        <span className="text-xs font-semibold text-text-primary truncate">{event.bookTitle}</span>
                      </div>
                      <p className="text-[9px] text-text-muted mt-0.5 font-mono">{timeAgo(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-border-primary">
          <p className="text-[9px] text-text-muted font-medium tracking-wider uppercase">
            eBook Creator · Analytics Dashboard · Powered by AI ✨
          </p>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
