import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import TextAreaField from "../components/ui/TextAreaField";
import SelectField from "../components/ui/SelectField";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import InteractiveTilt from "../components/ui/InteractiveTilt";
import BookCover from "../components/Editor/BookCover";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api/books";
const API_AI = "http://localhost:5000/api/ai";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "draft" | "published"
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "newest" | "alpha" | "progress"

  // Quick Action AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiAudience, setAiAudience] = useState("General Learners");
  const [aiTone, setAiTone] = useState("Friendly & Clear");
  const [aiLength, setAiLength] = useState("5 Chapters");
  const [aiDifficulty, setAiDifficulty] = useState("Beginner");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Modals & Menu States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Create Form State
  const [formValues, setFormValues] = useState({
    title: "",
    category: "Technology & Coding",
    writingStyle: "Conversational",
    prompt: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Categories
  const categories = [
    "Technology & Coding",
    "Business & Startups",
    "Fiction & Storytelling",
    "Self-Help & Growth",
    "Lifestyle & Health",
    "History & Science",
  ];

  // Writing Styles
  const writingStyles = [
    "Conversational",
    "Professional & Formal",
    "Academic & Analytical",
    "Creative & Narrative",
  ];

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Handle open creation modal if navigated with state
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsCreateOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchBooks = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(API_BASE, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load your eBooks library.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Greeting dynamic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Helper to calculate words & progress
  const getBookStats = (b) => {
    const chapters = b.chapters || [];
    const totalWords = chapters.reduce((acc, ch) => {
      const text = ch.body ? ch.body.replace(/<[^>]*>/g, " ").trim() : "";
      return acc + (text ? text.split(/\s+/).filter(Boolean).length : 0);
    }, 0);

    const completedChapters = chapters.filter((ch) => ch.body && ch.body.length > 100).length;
    const progress = chapters.length > 0 ? Math.round((completedChapters / chapters.length) * 100) : 0;

    return { totalWords, completedChapters, progress };
  };

  // Helper to parse description details
  const parseDescription = (desc) => {
    if (!desc) return { category: "General", style: "Conversational", prompt: "" };
    const categoryMatch = desc.match(/Category:\s*(.+)/i);
    const styleMatch = desc.match(/Style:\s*(.+)/i);
    const promptMatch = desc.match(/Prompt:\s*([\s\S]+)/i);

    let prompt = promptMatch ? promptMatch[1].trim() : desc;
    if (!promptMatch) {
      prompt = prompt.replace(/Category:\s*.+/gi, "").replace(/Style:\s*.+/gi, "").trim();
    }

    return {
      category: categoryMatch ? categoryMatch[1].split("\n")[0].trim() : "General",
      style: styleMatch ? styleMatch[1].split("\n")[0].trim() : "Conversational",
      prompt: prompt || desc,
    };
  };

  // Relative time helper
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Handle Form Change & Validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.title.trim()) errors.title = "Book title is required";
    if (!formValues.prompt.trim()) errors.prompt = "Please describe the book concept";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Standard Manual Creation
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    const toastId = toast.loading("Initializing eBook draft...");
    const token = localStorage.getItem("token");

    const serializedDescription = `Category: ${formValues.category}\nStyle: ${formValues.writingStyle}\n\nPrompt: ${formValues.prompt}`;

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formValues.title,
          description: serializedDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create book");
      }

      const newBook = await response.json();
      toast.success("eBook created successfully!", { id: toastId });
      setBooks((prev) => [newBook, ...prev]);
      setIsCreateOpen(false);
      setFormValues({
        title: "",
        category: "Technology & Coding",
        writingStyle: "Conversational",
        prompt: "",
      });
      navigate(`/editor?bookId=${newBook._id}`);
    } catch (err) {
      toast.error(err.message || "Could not create eBook. Try again.", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Fast AI Generator from Dashboard AI Box
  const handleAIGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiGenerating) return;

    setAiGenerating(true);
    const toastId = toast.loading("AI is structuring your complete book...");
    const token = localStorage.getItem("token");

    try {
      const aiRes = await fetch(`${API_AI}/generate-book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          difficulty: aiDifficulty,
          tone: aiTone,
          contentType: "Practical Guide",
          targetAudience: aiAudience,
          chaptersCount: parseInt(aiLength) || 5,
        }),
      });

      if (!aiRes.ok) throw new Error("AI outline structuring failed");
      const plan = await aiRes.json();

      const mappedChapters = (plan.chapters || []).map((ch, idx) => ({
        title: ch.title,
        body: "",
        status: "Draft",
        wordCount: 0,
        order: idx,
      }));

      const saveRes = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: plan.title || aiPrompt,
          subtitle: plan.subtitle || "",
          description: plan.description || `Audience: ${aiAudience}, Tone: ${aiTone}`,
          chapters: mappedChapters,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save generated book");
      const newBook = await saveRes.json();

      toast.success("eBook structured and ready to edit! ✨", { id: toastId });
      setBooks((prev) => [newBook, ...prev]);
      setAiPrompt("");
      navigate(`/editor?bookId=${newBook._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to generate book with AI.", { id: toastId });
    } finally {
      setAiGenerating(false);
    }
  };

  // Duplicate Book Action
  const handleDuplicateBook = async (bookToDup) => {
    const token = localStorage.getItem("token");
    const toastId = toast.loading("Duplicating eBook...");

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${bookToDup.title} (Copy)`,
          subtitle: bookToDup.subtitle || "",
          description: bookToDup.description || "",
          coverImage: bookToDup.coverImage || "",
          chapters: bookToDup.chapters || [],
          settings: bookToDup.settings || {},
          exportConfig: bookToDup.exportConfig || {},
        }),
      });

      if (!response.ok) throw new Error("Duplication failed");
      const newBook = await response.json();
      setBooks((prev) => [newBook, ...prev]);
      toast.success("eBook duplicated successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to duplicate eBook.", { id: toastId });
    }
  };

  // Rename Book Action
  const handleRenameConfirm = async (e) => {
    e.preventDefault();
    if (!selectedBook || !renameTitle.trim()) return;

    setActionLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/${selectedBook._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: renameTitle.trim() }),
      });

      if (!response.ok) throw new Error("Failed to rename eBook");
      const updated = await response.json();
      setBooks((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      toast.success("eBook renamed!");
      setIsRenameOpen(false);
      setSelectedBook(null);
    } catch (err) {
      toast.error("Could not rename eBook.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Book Action
  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;

    setActionLoading(true);
    const toastId = toast.loading("Deleting eBook...");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/${selectedBook._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete eBook");

      toast.success("eBook deleted successfully", { id: toastId });
      setBooks((prev) => prev.filter((b) => b._id !== selectedBook._id));
      setIsDeleteOpen(false);
      setSelectedBook(null);
    } catch (err) {
      toast.error(err.message || "Could not delete eBook.", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculation
  const totalBooks = books.length;
  const totalChapters = books.reduce((acc, curr) => acc + (curr.chapters?.length || 0), 0);
  const publishedBooks = books.filter((b) => b.isPublished).length;
  const draftBooks = books.filter((b) => !b.isPublished).length;

  // Search & Filter & Sort Logic
  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (statusFilter === "draft") return matchesSearch && !book.isPublished;
      if (statusFilter === "published") return matchesSearch && book.isPublished;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "alpha") return a.title.localeCompare(b.title);
      if (sortBy === "progress") {
        return getBookStats(b).progress - getBookStats(a).progress;
      }
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

  // Most recent active book for the "Continue Writing" hero showcase
  const mostRecentBook = books.length > 0 ? books[0] : null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans transition-colors duration-250 pb-20">
      
      {/* 1. CLEAN COMPACT HEADER */}
      <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-border-primary transition-colors duration-250">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-text-primary text-bg-primary flex items-center justify-center font-serif font-bold text-base shadow-xs">
                e
              </div>
              <span className="font-sans font-semibold text-base tracking-tight text-text-primary">
                eBook<span className="text-brand-purple">AI</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-text-secondary">
              <Link to="/dashboard" className="text-text-primary font-semibold py-1 border-b-2 border-brand-purple">
                Dashboard
              </Link>
              <a href="#your-books" className="hover:text-text-primary transition-colors py-1">
                Your Books
              </a>
              <Link to="/discover" className="hover:text-text-primary transition-colors py-1">
                Discover
              </Link>
              <Link to="/analytics" className="hover:text-text-primary transition-colors py-1">
                Analytics
              </Link>
              <Link to="/profile" className="hover:text-text-primary transition-colors py-1">
                Profile
              </Link>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            
            <button
              onClick={() => setIsCreateOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-text-primary text-bg-primary hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>+</span>
              <span>New Book</span>
            </button>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-bg-secondary border border-border-primary flex items-center justify-center font-bold text-xs text-text-primary hover:border-text-muted transition-colors cursor-pointer"
                title="Account menu"
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "ME"}
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-bg-primary rounded-xl shadow-xl border border-border-primary py-1.5 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-border-primary mb-1">
                    <span className="font-semibold block truncate text-text-primary">{user?.username || "User"}</span>
                    <span className="text-[10px] text-text-muted truncate block">{user?.email || "Signed in"}</span>
                  </div>
                  <Link to="/profile" className="block px-3 py-1.5 text-text-secondary hover:bg-bg-secondary hover:text-text-primary">
                    Profile Settings
                  </Link>
                  <Link to="/analytics" className="block px-3 py-1.5 text-text-secondary hover:bg-bg-secondary hover:text-text-primary">
                    Writing Analytics
                  </Link>
                  <div className="border-t border-border-primary my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-10 text-left">
        
        {/* 2. WELCOME & COMPACT SUMMARY */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-primary">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-text-primary tracking-tight mb-1">
              {getGreeting()}, {user?.username || "Writer"} 👋
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">
              Pick up where you left off or start something new with AI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/discover"
              className="px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              Explore Discover
            </Link>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              + Create New eBook
            </button>
          </div>
        </div>

        {/* COMPACT PROGRESS STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Books</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-1">{totalBooks}</span>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Drafts</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-1">{draftBooks}</span>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Published</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{publishedBooks}</span>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">AI Chapters</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-brand-purple mt-1">{totalChapters}</span>
          </div>
        </div>

        {/* 3. QUICK ACTIONS GRID */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
            Quick Actions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="p-3.5 rounded-xl bg-bg-secondary border border-border-primary hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-left group"
            >
              <span className="text-lg mb-1 block">✍️</span>
              <span className="text-xs font-semibold text-text-primary block group-hover:text-brand-purple">Create eBook</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Start fresh manual draft</span>
            </button>

            <a
              href="#ai-workspace"
              className="p-3.5 rounded-xl bg-bg-secondary border border-border-primary hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-left group"
            >
              <span className="text-lg mb-1 block">✨</span>
              <span className="text-xs font-semibold text-text-primary block group-hover:text-brand-purple">Generate with AI</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Structure from a topic</span>
            </a>

            {mostRecentBook ? (
              <Link
                to={`/editor?bookId=${mostRecentBook._id}`}
                className="p-3.5 rounded-xl bg-bg-secondary border border-border-primary hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-left group"
              >
                <span className="text-lg mb-1 block">📖</span>
                <span className="text-xs font-semibold text-text-primary block group-hover:text-brand-purple">Continue Writing</span>
                <span className="text-[10px] text-text-muted block mt-0.5 truncate">{mostRecentBook.title}</span>
              </Link>
            ) : (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="p-3.5 rounded-xl bg-bg-secondary border border-border-primary text-left opacity-60"
              >
                <span className="text-lg mb-1 block">📖</span>
                <span className="text-xs font-semibold text-text-primary block">Continue Writing</span>
                <span className="text-[10px] text-text-muted block mt-0.5">No active drafts</span>
              </button>
            )}

            <Link
              to="/discover"
              className="p-3.5 rounded-xl bg-bg-secondary border border-border-primary hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-left group"
            >
              <span className="text-lg mb-1 block">🌍</span>
              <span className="text-xs font-semibold text-text-primary block group-hover:text-brand-purple">Discover Hub</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Explore published books</span>
            </Link>
          </div>
        </div>

        {/* 4. CONTINUE WRITING (ACTIVE PROJECT SPOTLIGHT) */}
        {mostRecentBook && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <span>⚡</span>
                <span>Continue Writing (Active Project)</span>
              </span>
              <span className="text-xs text-brand-purple font-semibold">
                Last edited {getRelativeTime(mostRecentBook.updatedAt || mostRecentBook.createdAt)}
              </span>
            </div>

            {(() => {
              const { totalWords, completedChapters, progress } = getBookStats(mostRecentBook);
              const { category } = parseDescription(mostRecentBook.description);
              const coverConfig = mostRecentBook.settings?.coverConfig || { style: "modern", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" };
              const nextChapterIdx = completedChapters < (mostRecentBook.chapters?.length || 0) ? completedChapters + 1 : mostRecentBook.chapters?.length || 1;

              return (
                <InteractiveTilt maxTilt={2} scale={1.006} className="w-full">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-bg-secondary via-bg-secondary to-bg-primary border border-border-primary hover:border-brand-purple/50 hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    
                    <div className="flex items-start gap-5 min-w-0 flex-1">
                      <div className="w-20 h-28 rounded-r shadow-lg shrink-0 overflow-hidden relative border-l-2 border-black/30">
                        <BookCover
                          config={coverConfig}
                          title={mostRecentBook.title}
                          author={user?.username || "Author"}
                          className="w-full h-full text-[6px]"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                            {category}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">
                            {mostRecentBook.chapters?.length || 0} Chapters
                          </span>
                        </div>

                        <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary truncate">
                          {mostRecentBook.title}
                        </h2>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
                            <span>Progress: {progress}% ({completedChapters} of {mostRecentBook.chapters?.length || 0} complete)</span>
                            <span>{totalWords.toLocaleString()} words</span>
                          </div>
                          <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden border border-border-primary">
                            <div
                              className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(5, progress)}%` }}
                            ></div>
                          </div>
                        </div>

                        <p className="text-xs text-text-secondary pt-1">
                          Recommended next step: <strong className="text-text-primary">Finish Chapter {nextChapterIdx}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border-primary">
                      <Link
                        to={`/editor?bookId=${mostRecentBook._id}`}
                        className="w-full md:w-auto px-6 py-3 rounded-xl bg-text-primary text-bg-primary text-xs font-bold hover:opacity-90 transition-opacity shadow-md text-center"
                      >
                        Continue Editing Chapter {nextChapterIdx} ➔
                      </Link>
                      <Link
                        to={`/view-book/${mostRecentBook._id}`}
                        className="w-full md:w-auto px-4 py-2 rounded-xl bg-bg-primary hover:bg-bg-tertiary border border-border-primary text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors text-center"
                      >
                        Preview eBook
                      </Link>
                    </div>

                  </div>
                </InteractiveTilt>
              );
            })()}
          </div>
        )}

        {/* 5. SEPARATE "YOUR BOOKS" SECTION + AI GENERATOR WORKSPACE */}
        <div id="your-books" className="pt-4 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-primary">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
                Your Books Library
              </h2>
              <p className="text-xs text-text-secondary">
                Manage, edit, duplicate, and publish your book catalogue.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-text-primary text-bg-primary text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs self-start sm:self-auto"
            >
              + Create eBook
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Filter & List of All Books */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-secondary p-3 rounded-xl border border-border-primary">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search your books by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-bg-primary text-xs text-text-primary rounded-lg border border-border-primary focus:outline-none focus:border-brand-purple placeholder:text-text-muted"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">🔍</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-bg-primary border border-border-primary rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Drafts</option>
                    <option value="published">Published</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs bg-bg-primary border border-border-primary rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="recent">Recently Edited</option>
                    <option value="newest">Newest</option>
                    <option value="alpha">Alphabetical</option>
                    <option value="progress">Writing Progress</option>
                  </select>
                </div>
              </div>

              {/* Books List Grid */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-bg-secondary rounded-xl border border-border-primary animate-pulse"></div>
                  ))}
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-bg-secondary border border-border-primary space-y-3">
                  <div className="w-12 h-12 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto text-xl font-bold">
                    📚
                  </div>
                  <h3 className="font-display font-semibold text-base text-text-primary">
                    No eBooks found
                  </h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    {searchQuery ? "Try refining your search query or filters." : "Start building your library with a new eBook draft."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredBooks.map((b) => {
                    const { totalWords, completedChapters, progress } = getBookStats(b);
                    const { category } = parseDescription(b.description);
                    const coverConfig = b.settings?.coverConfig || { style: "modern", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" };

                    return (
                      <InteractiveTilt key={b._id} maxTilt={1.5} scale={1.005} className="w-full">
                        <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary hover:border-text-muted hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group">
                          
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-12 h-16 rounded-r shadow shrink-0 overflow-hidden relative border-l-2 border-black/30">
                              <BookCover
                                config={coverConfig}
                                title={b.title}
                                author={user?.username || "Author"}
                                className="w-full h-full text-[4px]"
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-bg-primary border border-border-primary text-brand-purple">
                                  {category}
                                </span>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                    b.isPublished
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : "bg-bg-primary text-text-muted border border-border-primary"
                                  }`}
                                >
                                  {b.isPublished ? "Published" : "Draft"}
                                </span>
                                <span className="text-[10px] text-text-muted font-mono ml-auto">
                                  {getRelativeTime(b.updatedAt || b.createdAt)}
                                </span>
                              </div>

                              <h3 className="font-display font-bold text-sm sm:text-base text-text-primary truncate">
                                {b.title}
                              </h3>

                              <div className="flex items-center gap-3 text-[11px] text-text-muted font-mono">
                                <span>{b.chapters?.length || 0} Ch. ({completedChapters} done)</span>
                                <span>•</span>
                                <span>{totalWords.toLocaleString()} words</span>
                                <span>•</span>
                                <span>{progress}% progress</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-primary">
                            <Link
                              to={`/editor?bookId=${b._id}`}
                              className="px-3.5 py-1.5 rounded-lg bg-text-primary text-bg-primary text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
                            >
                              Edit ➔
                            </Link>

                            <div className="relative">
                              <button
                                onClick={() => setActiveMenuId(activeMenuId === b._id ? null : b._id)}
                                className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary text-xs"
                                title="Actions"
                              >
                                •••
                              </button>

                              {activeMenuId === b._id && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-36 bg-bg-primary rounded-xl shadow-xl border border-border-primary py-1.5 z-50 text-xs"
                                  onMouseLeave={() => setActiveMenuId(null)}
                                >
                                  <Link
                                    to={`/view-book/${b._id}`}
                                    className="block px-3 py-1.5 text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                                  >
                                    Preview Book
                                  </Link>
                                  <button
                                    onClick={() => {
                                      handleDuplicateBook(b);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-text-secondary hover:bg-bg-secondary hover:text-text-primary cursor-pointer"
                                  >
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBook(b);
                                      setRenameTitle(b.title);
                                      setIsRenameOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-text-secondary hover:bg-bg-secondary hover:text-text-primary cursor-pointer"
                                  >
                                    Rename
                                  </button>
                                  <div className="border-t border-border-primary my-1"></div>
                                  <button
                                    onClick={() => {
                                      setSelectedBook(b);
                                      setIsDeleteOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </InteractiveTilt>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Right 4 Cols: AI Workspace Box */}
            <div id="ai-workspace" className="lg:col-span-4 space-y-6">
              
              <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border-primary">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-text-primary">Create with AI</h3>
                    <p className="text-[11px] text-text-muted">Generate full book plan & chapters</p>
                  </div>
                </div>

                <form onSubmit={handleAIGenerate} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                      What do you want to write?
                    </label>
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. 'Complete beginner-friendly C programming handbook with exercises'..."
                      className="w-full p-2.5 rounded-xl bg-bg-primary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-brand-purple resize-none placeholder:text-text-muted"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {[
                      "Python Interview Guide",
                      "Mindful Stoicism",
                      "Cloud Microservices",
                    ].map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(ex)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-bg-primary hover:bg-brand-purple/10 hover:text-brand-purple text-text-secondary border border-border-primary transition-colors truncate"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-text-muted block mb-0.5">Audience</label>
                      <select
                        value={aiAudience}
                        onChange={(e) => setAiAudience(e.target.value)}
                        className="w-full p-1.5 text-xs bg-bg-primary border border-border-primary rounded-lg text-text-primary focus:outline-none"
                      >
                        <option value="Beginners">Beginners</option>
                        <option value="Engineers">Engineers</option>
                        <option value="Students">Students</option>
                        <option value="Professionals">Professionals</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-text-muted block mb-0.5">Tone</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full p-1.5 text-xs bg-bg-primary border border-border-primary rounded-lg text-text-primary focus:outline-none"
                      >
                        <option value="Friendly & Clear">Friendly</option>
                        <option value="Professional & Formal">Professional</option>
                        <option value="Academic">Academic</option>
                        <option value="Creative">Creative</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!aiPrompt.trim() || aiGenerating}
                    className="w-full py-2.5 text-xs font-semibold rounded-xl shadow-xs"
                  >
                    {aiGenerating ? "Structuring eBook..." : "Generate eBook ✨"}
                  </Button>
                </form>
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary/60 border border-border-primary space-y-2">
                <span className="text-[11px] font-semibold text-text-primary flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Publishing Pro Tip</span>
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Export to high-fidelity PDF with auto-generated cover pages and table of contents directly from the Editor workspace.
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* MODAL: Manual Create eBook */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New eBook" maxWidth="max-w-lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
          <InputField
            label="eBook Title"
            name="title"
            placeholder="e.g. Mastering Modern React"
            value={formValues.title}
            onChange={handleInputChange}
            error={formErrors.title}
            disabled={actionLoading}
            required
          />

          <SelectField
            label="Category / Niche"
            name="category"
            value={formValues.category}
            onChange={handleInputChange}
            options={categories}
            disabled={actionLoading}
            required
          />

          <SelectField
            label="Writing Tone & Style"
            name="writingStyle"
            value={formValues.writingStyle}
            onChange={handleInputChange}
            options={writingStyles}
            disabled={actionLoading}
            required
          />

          <TextAreaField
            label="Initial Outline / Concept Prompt"
            name="prompt"
            placeholder="Describe what your eBook is about or outline the chapters..."
            value={formValues.prompt}
            onChange={handleInputChange}
            error={formErrors.prompt}
            disabled={actionLoading}
            required
          />

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-primary">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-text-secondary bg-bg-secondary hover:bg-bg-tertiary rounded-xl border border-border-primary"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" disabled={actionLoading} className="px-5 py-2 text-xs font-semibold rounded-xl">
              {actionLoading ? "Creating..." : "Initialize eBook Draft ➔"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Rename Book */}
      <Modal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} title="Rename eBook" maxWidth="max-w-md">
        <form onSubmit={handleRenameConfirm} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold uppercase text-text-muted block mb-1">New Title</label>
            <input
              type="text"
              required
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className="w-full text-xs sm:text-sm bg-bg-secondary border border-border-primary rounded-xl p-2.5 text-text-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-primary">
            <button
              type="button"
              onClick={() => setIsRenameOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-text-secondary bg-bg-secondary rounded-xl border border-border-primary"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" disabled={actionLoading} className="px-5 py-2 text-xs font-semibold rounded-xl">
              Save Title
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete eBook" maxWidth="max-w-md">
        <div className="space-y-4 text-left">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Are you sure you want to delete <strong className="text-text-primary">"{selectedBook?.title}"</strong>? This will permanently remove all chapters and draft history.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-primary">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-text-secondary bg-bg-secondary rounded-xl border border-border-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs"
            >
              {actionLoading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default DashboardPage;
