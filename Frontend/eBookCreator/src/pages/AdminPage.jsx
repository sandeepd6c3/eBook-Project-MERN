import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import Modal from "../components/ui/Modal";
import BookCover from "../components/Editor/BookCover";
import toast from "react-hot-toast";

const API_ADMIN = "http://localhost:5000/api/admin";

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: "overview" | "books" | "users"
  const [activeTab, setActiveTab] = useState("overview");

  // State: Stats
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // State: Books
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [bookStatusFilter, setBookStatusFilter] = useState("all");
  const [bookCategoryFilter, setBookCategoryFilter] = useState("all");

  // State: Users
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Modals
  const [previewBook, setPreviewBook] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activePreviewChapterIndex, setActivePreviewChapterIndex] = useState(0);

  const [deleteBookTarget, setDeleteBookTarget] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch initial stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch data on tab change
  useEffect(() => {
    if (activeTab === "books") {
      fetchBooks();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_ADMIN}/stats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load admin statistics");
      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
      setRecentBooks(data.recentBooks || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load platform stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchBooks = async () => {
    setBooksLoading(true);
    try {
      const res = await fetch(`${API_ADMIN}/books`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load books catalog");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not fetch platform books");
    } finally {
      setBooksLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_ADMIN}/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load user list");
      const data = await res.json();
      setUsersList(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Open Full Book Inspection Modal
  const handleOpenPreview = async (bookId) => {
    setPreviewLoading(true);
    setPreviewBook(null);
    setActivePreviewChapterIndex(0);
    try {
      const res = await fetch(`${API_ADMIN}/books/${bookId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load full book details");
      const data = await res.json();
      setPreviewBook(data);
    } catch (err) {
      toast.error(err.message || "Could not inspect book");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Delete Book
  const handleDeleteBookConfirm = async () => {
    if (!deleteBookTarget) return;
    setActionLoading(true);
    const toastId = toast.loading("Deleting eBook from platform...");
    try {
      const res = await fetch(`${API_ADMIN}/books/${deleteBookTarget._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete book");
      toast.success("eBook removed from platform", { id: toastId });
      setBooks((prev) => prev.filter((b) => b._id !== deleteBookTarget._id));
      setDeleteBookTarget(null);
      // Refresh stats in background
      fetchStats();
    } catch (err) {
      toast.error(err.message || "Could not delete book", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User
  const handleDeleteUserConfirm = async () => {
    if (!deleteUserTarget) return;
    setActionLoading(true);
    const toastId = toast.loading("Deleting user and their assets...");
    try {
      const res = await fetch(`${API_ADMIN}/users/${deleteUserTarget._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");
      toast.success("User and associated books removed", { id: toastId });
      setUsersList((prev) => prev.filter((u) => u._id !== deleteUserTarget._id));
      setDeleteUserTarget(null);
      // Refresh stats in background
      fetchStats();
    } catch (err) {
      toast.error(err.message || "Could not delete user", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Role
  const handleRoleChangeConfirm = async (newRole) => {
    if (!roleChangeUser) return;
    setActionLoading(true);
    const toastId = toast.loading(`Updating role to ${newRole}...`);
    try {
      const res = await fetch(`${API_ADMIN}/users/${roleChangeUser._id}/role`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");
      toast.success(`Role updated to ${newRole}`, { id: toastId });
      setUsersList((prev) =>
        prev.map((u) => (u._id === roleChangeUser._id ? { ...u, role: newRole } : u))
      );
      setRoleChangeUser(null);
    } catch (err) {
      toast.error(err.message || "Could not update user role", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const authorName = b.author?.username || "";
    const authorEmail = b.author?.email || "";
    const matchesSearch =
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.description.toLowerCase().includes(bookSearch.toLowerCase()) ||
      authorName.toLowerCase().includes(bookSearch.toLowerCase()) ||
      authorEmail.toLowerCase().includes(bookSearch.toLowerCase());

    if (bookStatusFilter === "published" && !b.isPublished) return false;
    if (bookStatusFilter === "draft" && b.isPublished) return false;

    if (bookCategoryFilter !== "all") {
      if (!b.description || !b.description.toLowerCase().includes(bookCategoryFilter.toLowerCase())) {
        return false;
      }
    }

    return matchesSearch;
  });

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const query = userSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.role && u.role.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans transition-colors duration-250 pb-20">
      
      {/* 1. ADMIN HEADER */}
      <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-text-primary text-bg-primary flex items-center justify-center font-serif font-bold text-base shadow-xs">
                e
              </div>
              <span className="font-sans font-semibold text-base tracking-tight text-text-primary">
                eBook<span className="text-brand-purple">AI</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Admin Console
            </span>

            <nav className="hidden md:flex items-center gap-2 text-xs font-medium">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "overview"
                    ? "bg-bg-secondary text-text-primary font-bold border border-border-primary shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                📊 Platform Overview
              </button>
              <button
                onClick={() => setActiveTab("books")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "books"
                    ? "bg-bg-secondary text-text-primary font-bold border border-border-primary shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                📚 All eBooks ({stats?.totalBooks ?? "..."})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "users"
                    ? "bg-bg-secondary text-text-primary font-bold border border-border-primary shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                👥 User Management ({stats?.totalUsers ?? "..."})
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />

            <Link
              to="/dashboard"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-primary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <span>Writer Dashboard</span>
              <span>➔</span>
            </Link>

            <button
              onClick={() => {
                logout();
                toast.success("Logged out");
                navigate("/login");
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE NAVIGATION PILLS */}
      <div className="md:hidden max-w-7xl mx-auto px-6 pt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
            activeTab === "overview"
              ? "bg-text-primary text-bg-primary"
              : "bg-bg-secondary text-text-secondary border border-border-primary"
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
            activeTab === "books"
              ? "bg-text-primary text-bg-primary"
              : "bg-bg-secondary text-text-secondary border border-border-primary"
          }`}
        >
          📚 Books ({stats?.totalBooks ?? "..."})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
            activeTab === "users"
              ? "bg-text-primary text-bg-primary"
              : "bg-bg-secondary text-text-secondary border border-border-primary"
          }`}
        >
          👥 Users ({stats?.totalUsers ?? "..."})
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8 text-left">
        
        {/* ============================================================
            TAB 1: PLATFORM OVERVIEW & METRICS
        ============================================================ */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Header Title */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-text-primary font-bold tracking-tight">
                Platform Intelligence & Controls
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Real-time aggregated health, content generation statistics, and user activities across production.
              </p>
            </div>

            {/* KPI METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between shadow-xs">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Users</span>
                <span className="font-display text-2xl font-bold text-text-primary mt-2">
                  {statsLoading ? "..." : (stats?.totalUsers || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-500 mt-1 font-mono">Platform Accounts</span>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between shadow-xs">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total eBooks</span>
                <span className="font-display text-2xl font-bold text-brand-purple mt-2">
                  {statsLoading ? "..." : (stats?.totalBooks || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-text-muted mt-1 font-mono">
                  {stats?.publishedBooks || 0} Pub / {stats?.draftBooks || 0} Draft
                </span>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between shadow-xs">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Chapters</span>
                <span className="font-display text-2xl font-bold text-text-primary mt-2">
                  {statsLoading ? "..." : (stats?.totalChapters || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-text-muted mt-1 font-mono">Authored & AI</span>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between shadow-xs">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Words</span>
                <span className="font-display text-2xl font-bold text-brand-blue mt-2">
                  {statsLoading ? "..." : (stats?.totalWords || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-text-muted mt-1 font-mono">Platform Words</span>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between shadow-xs">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Published Books</span>
                <span className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {statsLoading ? "..." : (stats?.publishedBooks || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-500 mt-1 font-mono">In Discover Hub</span>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between shadow-xs">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Readers</span>
                <span className="font-display text-2xl font-bold text-text-primary mt-2">
                  {statsLoading ? "..." : (stats?.totalReads || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-text-muted mt-1 font-mono">{stats?.totalReviews || 0} Reviews</span>
              </div>
            </div>

            {/* QUICK ACTIONS & RECENT ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent User Signups */}
              <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-4">
                <div className="flex items-center justify-between border-b border-border-primary pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👤</span>
                    <h3 className="font-display font-semibold text-sm text-text-primary">Recent User Registrations</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-xs text-brand-purple hover:underline font-semibold"
                  >
                    View All Users ➔
                  </button>
                </div>

                <div className="divide-y divide-border-primary">
                  {recentUsers.length === 0 ? (
                    <p className="text-xs text-text-muted py-3">No user records available.</p>
                  ) : (
                    recentUsers.map((u) => (
                      <div key={u._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-bg-primary border border-border-primary flex items-center justify-center font-bold text-[10px] text-text-primary shrink-0">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-text-primary block truncate">{u.username}</span>
                            <span className="text-[10px] text-text-muted block truncate">{u.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                            u.role === "admin"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-bg-primary text-text-secondary border border-border-primary"
                          }`}>
                            {u.role || "creator"}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Books Created */}
              <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-4">
                <div className="flex items-center justify-between border-b border-border-primary pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📖</span>
                    <h3 className="font-display font-semibold text-sm text-text-primary">Recent eBooks Created</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("books")}
                    className="text-xs text-brand-purple hover:underline font-semibold"
                  >
                    Manage Books ➔
                  </button>
                </div>

                <div className="divide-y divide-border-primary">
                  {recentBooks.length === 0 ? (
                    <p className="text-xs text-text-muted py-3">No books created yet.</p>
                  ) : (
                    recentBooks.map((b) => (
                      <div key={b._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="font-semibold text-text-primary block truncate">{b.title}</span>
                          <span className="text-[10px] text-text-muted block truncate">
                            By {b.author?.username || "Unknown"} ({b.author?.email || "No email"})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            b.isPublished
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-bg-primary text-text-muted border border-border-primary"
                          }`}>
                            {b.isPublished ? "Published" : "Draft"}
                          </span>
                          <button
                            onClick={() => handleOpenPreview(b._id)}
                            className="px-2 py-1 rounded bg-bg-primary hover:bg-bg-tertiary border border-border-primary text-[10px] font-semibold text-text-primary transition-colors"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================
            TAB 2: ALL EBOOKS CATALOG & MODERATION
        ============================================================ */}
        {activeTab === "books" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-primary">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
                  Global eBooks Management ({filteredBooks.length} Books)
                </h2>
                <p className="text-xs text-text-secondary">
                  Inspect, moderate, preview, or remove any book created across the entire platform.
                </p>
              </div>

              <button
                onClick={fetchBooks}
                className="px-3.5 py-1.5 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors self-start sm:self-auto"
              >
                🔄 Refresh Catalog
              </button>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-secondary p-3 rounded-xl border border-border-primary">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by book title, description, or author name / email..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-bg-primary text-xs text-text-primary rounded-lg border border-border-primary focus:outline-none focus:border-brand-purple placeholder:text-text-muted"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">🔍</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={bookStatusFilter}
                  onChange={(e) => setBookStatusFilter(e.target.value)}
                  className="text-xs bg-bg-primary border border-border-primary rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Drafts Only</option>
                  <option value="published">Published Only</option>
                </select>

                <select
                  value={bookCategoryFilter}
                  onChange={(e) => setBookCategoryFilter(e.target.value)}
                  className="text-xs bg-bg-primary border border-border-primary rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Science">Science</option>
                </select>
              </div>
            </div>

            {/* BOOKS TABLE */}
            {booksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-bg-secondary rounded-xl border border-border-primary animate-pulse"></div>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-bg-secondary border border-border-primary space-y-3">
                <div className="text-2xl">📚</div>
                <h3 className="font-semibold text-sm text-text-primary">No eBooks Match Query</h3>
                <p className="text-xs text-text-secondary">Try clearing your search query or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border-primary bg-bg-secondary">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-primary/50 text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border-primary">
                    <tr>
                      <th className="py-3 px-4">eBook Title & Summary</th>
                      <th className="py-3 px-4">Author Details</th>
                      <th className="py-3 px-4">Chapters</th>
                      <th className="py-3 px-4">Word Count</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    {filteredBooks.map((b) => {
                      const coverConfig = b.settings?.coverConfig || { style: "modern", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" };
                      return (
                        <tr key={b._id} className="hover:bg-bg-primary/30 transition-colors">
                          <td className="py-3 px-4 min-w-[240px]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-11 rounded shrink-0 overflow-hidden shadow-xs border border-border-primary">
                                <BookCover
                                  config={coverConfig}
                                  title={b.title}
                                  author={b.author?.username || "Author"}
                                  className="w-full h-full text-[4px]"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-text-primary block truncate max-w-[200px] sm:max-w-[280px]">
                                  {b.title}
                                </span>
                                {b.subtitle && (
                                  <span className="text-[10px] text-text-muted block truncate max-w-[200px]">
                                    {b.subtitle}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 min-w-[160px]">
                            <span className="font-semibold text-text-primary block truncate">
                              {b.author?.username || "Unknown"}
                            </span>
                            <span className="text-[10px] text-text-muted block truncate">
                              {b.author?.email || "No email"}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-semibold text-text-primary">
                            {b.chapterCount} ch
                          </td>

                          <td className="py-3 px-4 font-mono text-text-secondary">
                            {b.wordCount.toLocaleString()} w
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.isPublished
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-bg-primary text-text-muted border border-border-primary"
                            }`}>
                              {b.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-text-muted font-mono text-[11px] whitespace-nowrap">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenPreview(b._id)}
                                className="px-2.5 py-1 rounded-lg bg-bg-primary hover:bg-bg-tertiary border border-border-primary text-xs font-semibold text-text-primary transition-colors"
                                title="Inspect & Preview Full Content"
                              >
                                👁️ Open
                              </button>
                              <button
                                onClick={() => setDeleteBookTarget(b)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-500 transition-colors"
                                title="Delete Book as Admin"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* ============================================================
            TAB 3: USER MANAGEMENT & ACCESS CONTROL
        ============================================================ */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-primary">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
                  Registered Users ({filteredUsers.length} Users)
                </h2>
                <p className="text-xs text-text-secondary">
                  Inspect user metrics, assign administrative roles, or delete accounts securely.
                </p>
              </div>

              <button
                onClick={fetchUsers}
                className="px-3.5 py-1.5 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors self-start sm:self-auto"
              >
                🔄 Refresh Users
              </button>
            </div>

            {/* SEARCH */}
            <div className="bg-bg-secondary p-3 rounded-xl border border-border-primary">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user by username, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-bg-primary text-xs text-text-primary rounded-lg border border-border-primary focus:outline-none focus:border-brand-purple placeholder:text-text-muted"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">🔍</span>
              </div>
            </div>

            {/* USERS TABLE */}
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-bg-secondary rounded-xl border border-border-primary animate-pulse"></div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-bg-secondary border border-border-primary space-y-3">
                <div className="text-2xl">👥</div>
                <h3 className="font-semibold text-sm text-text-primary">No Users Found</h3>
                <p className="text-xs text-text-secondary">Try searching with a different keyword.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border-primary bg-bg-secondary">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-primary/50 text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border-primary">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Books Created</th>
                      <th className="py-3 px-4">Words Authored</th>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    {filteredUsers.map((u) => {
                      const isSelf = u._id === user?._id;
                      return (
                        <tr key={u._id} className="hover:bg-bg-primary/30 transition-colors">
                          <td className="py-3 px-4 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-bg-primary border border-border-primary flex items-center justify-center font-bold text-xs text-text-primary shrink-0">
                                {u.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-text-primary block truncate">
                                  {u.username} {isSelf && <span className="text-[10px] text-brand-purple font-mono font-normal">(You)</span>}
                                </span>
                                <span className="text-[10px] text-text-muted block truncate">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === "admin"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-bg-primary text-text-secondary border border-border-primary"
                            }`}>
                              {u.role || "creator"}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-semibold text-text-primary">
                            {u.booksCount} books ({u.publishedBooksCount} pub)
                          </td>

                          <td className="py-3 px-4 font-mono text-text-secondary">
                            {u.totalWordsWritten.toLocaleString()} w
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-bg-primary border border-border-primary text-text-muted uppercase">
                              {u.subscriptionTier || "free"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-text-muted font-mono text-[11px] whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Role button */}
                              <button
                                onClick={() => setRoleChangeUser(u)}
                                disabled={isSelf}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                                  isSelf
                                    ? "opacity-30 cursor-not-allowed bg-bg-primary border-border-primary"
                                    : "bg-bg-primary hover:bg-bg-tertiary border-border-primary text-text-primary"
                                }`}
                                title={isSelf ? "Cannot edit own role" : "Change User Role"}
                              >
                                🛡️ Role
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => setDeleteUserTarget(u)}
                                disabled={isSelf}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                                  isSelf
                                    ? "opacity-30 cursor-not-allowed bg-bg-primary border-border-primary"
                                    : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-500"
                                }`}
                                title={isSelf ? "Cannot delete own account here" : "Delete User Account"}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ============================================================
          MODAL 1: FULL BOOK INSPECTION / PREVIEW
      ============================================================ */}
      <Modal
        isOpen={!!previewBook || previewLoading}
        onClose={() => setPreviewBook(null)}
        title={previewBook ? `Admin Inspection: ${previewBook.title}` : "Loading eBook Details..."}
      >
        {previewLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-border-primary border-t-brand-purple rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-text-muted">Loading full chapters and author data...</p>
          </div>
        ) : previewBook ? (
          <div className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-1">
            
            {/* Book Meta Header */}
            <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary">{previewBook.title}</h3>
                {previewBook.subtitle && (
                  <p className="text-xs text-text-secondary mt-0.5">{previewBook.subtitle}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-text-muted mt-2 font-mono">
                  <span>Author: <strong>{previewBook.author?.username || "N/A"}</strong> ({previewBook.author?.email})</span>
                  <span>•</span>
                  <span>Created: {new Date(previewBook.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Status: <strong className={previewBook.isPublished ? "text-emerald-500" : "text-amber-500"}>{previewBook.isPublished ? "Published" : "Draft"}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setDeleteBookTarget(previewBook);
                    setPreviewBook(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold border border-rose-500/30 transition-colors"
                >
                  Delete Book
                </button>
              </div>
            </div>

            {/* Description Details */}
            {previewBook.description && (
              <div className="p-3 rounded-lg bg-bg-secondary/50 border border-border-primary text-xs space-y-1">
                <span className="font-bold text-[10px] uppercase tracking-wider text-text-muted block">Book Concept / Prompt</span>
                <p className="text-text-secondary whitespace-pre-line">{previewBook.description}</p>
              </div>
            )}

            {/* Chapters Navigation & Content View */}
            <div className="space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider text-text-muted block">
                Chapters Content ({previewBook.chapters?.length || 0} Chapters)
              </span>

              {(!previewBook.chapters || previewBook.chapters.length === 0) ? (
                <p className="text-xs text-text-muted py-4">This eBook does not have any chapters yet.</p>
              ) : (
                <div className="space-y-4">
                  
                  {/* Chapter Select Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border-primary">
                    {previewBook.chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePreviewChapterIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          activePreviewChapterIndex === idx
                            ? "bg-text-primary text-bg-primary font-bold shadow-xs"
                            : "bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-primary"
                        }`}
                      >
                        Ch {idx + 1}: {ch.title.substring(0, 20)}...
                      </button>
                    ))}
                  </div>

                  {/* Active Chapter Reader */}
                  {(() => {
                    const activeCh = previewBook.chapters[activePreviewChapterIndex] || previewBook.chapters[0];
                    return (
                      <div className="p-5 rounded-xl bg-bg-secondary border border-border-primary space-y-3">
                        <div className="flex items-center justify-between border-b border-border-primary pb-2">
                          <h4 className="font-display font-bold text-base text-text-primary">
                            {activeCh.title}
                          </h4>
                          <span className="text-[10px] text-text-muted font-mono">
                            {activeCh.body ? activeCh.body.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length : 0} words
                          </span>
                        </div>

                        <div className="text-xs leading-relaxed text-text-secondary space-y-2 max-h-[350px] overflow-y-auto pr-2">
                          {activeCh.body ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: activeCh.body }}
                              className="prose prose-sm dark:prose-invert max-w-none"
                            />
                          ) : (
                            <p className="italic text-text-muted">This chapter body is currently empty.</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}
            </div>

          </div>
        ) : null}
      </Modal>

      {/* ============================================================
          MODAL 2: DELETE BOOK CONFIRMATION
      ============================================================ */}
      <Modal
        isOpen={!!deleteBookTarget}
        onClose={() => setDeleteBookTarget(null)}
        title="Admin: Confirm eBook Deletion"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-text-secondary">
            Are you sure you want to permanently delete the eBook <strong className="text-text-primary">"{deleteBookTarget?.title}"</strong> created by <strong className="text-text-primary">{deleteBookTarget?.author?.username}</strong>?
          </p>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            ⚠️ This will remove the entire book, chapters, and revision history permanently from the database.
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteBookTarget(null)}
              className="px-4 py-2 rounded-lg bg-bg-secondary border border-border-primary text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteBookConfirm}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Deleting..." : "Permanently Delete Book"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          MODAL 3: DELETE USER CONFIRMATION
      ============================================================ */}
      <Modal
        isOpen={!!deleteUserTarget}
        onClose={() => setDeleteUserTarget(null)}
        title="Admin: Confirm User Deletion"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-text-secondary">
            Are you sure you want to permanently delete the user account <strong className="text-text-primary">{deleteUserTarget?.username}</strong> ({deleteUserTarget?.email})?
          </p>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            ⚠️ This action will delete the user account and <strong>ALL {deleteUserTarget?.booksCount || 0} books</strong> authored by this user.
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteUserTarget(null)}
              className="px-4 py-2 rounded-lg bg-bg-secondary border border-border-primary text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUserConfirm}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Deleting..." : "Permanently Delete User & Data"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================
          MODAL 4: ROLE ASSIGNMENT
      ============================================================ */}
      <Modal
        isOpen={!!roleChangeUser}
        onClose={() => setRoleChangeUser(null)}
        title={`Change Role: ${roleChangeUser?.username}`}
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-text-secondary">
            Select the access level for <strong className="text-text-primary">{roleChangeUser?.email}</strong>:
          </p>

          <div className="space-y-2">
            {[
              { id: "creator", title: "Creator (Standard)", desc: "Can write, generate, and manage their own books only." },
              { id: "admin", title: "Admin (Platform Owner)", desc: "Full access to platform metrics, all user books, and management." },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleChangeConfirm(r.id)}
                disabled={actionLoading}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  roleChangeUser?.role === r.id
                    ? "border-brand-purple bg-brand-purple/5 font-semibold"
                    : "border-border-primary bg-bg-secondary hover:bg-bg-tertiary"
                }`}
              >
                <span className="text-xs font-bold text-text-primary block">{r.title}</span>
                <span className="text-[10px] text-text-muted block mt-0.5">{r.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setRoleChangeUser(null)}
              className="px-4 py-2 rounded-lg bg-bg-secondary border border-border-primary text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AdminPage;
