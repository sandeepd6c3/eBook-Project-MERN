import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import toast from "react-hot-toast";

// Reusable Book Cover for the Shelf
const BookShelfCover = ({ config, title, className = "" }) => {
  const isGradientClass = config?.gradient && (config.gradient.startsWith("bg-") || config.gradient.includes("from-"));

  return (
    <div
      className={`relative rounded-r-sm shadow-md overflow-hidden border-l-[2px] border-black/30 flex flex-col justify-between p-2 aspect-[3/4.2] text-white hover:scale-105 transition-transform duration-300 ${className}`}
      style={{
        backgroundImage: config?.imageUrl ? `url(${config.imageUrl})` : undefined,
        backgroundSize: config?.imageUrl ? "cover" : undefined,
        backgroundPosition: config?.imageUrl ? "center" : undefined,
        background: config?.imageUrl ? undefined : (isGradientClass ? undefined : (config?.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)")),
      }}
    >
      {/* Spine crease shadow */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-r from-black/25 via-white/5 to-transparent z-10"></div>
      
      {/* Readability overlay */}
      {config?.imageUrl && <div className="absolute inset-0 bg-black/40 z-0"></div>}

      <div className="relative z-10 w-full h-full flex flex-col justify-between text-left">
        <span className="text-[5px] tracking-widest uppercase opacity-60 font-mono">
          {config?.style || "Modern"}
        </span>
        <h5 className="font-display font-medium text-[8px] sm:text-[9px] leading-tight text-white line-clamp-3">
          {title}
        </h5>
        <div className="text-[5px] opacity-75 font-mono truncate">
          {config?.subtitle || "EBOOK"}
        </div>
      </div>
    </div>
  );
};

// Instagram-style Library Square Card
const LibraryGridCard = ({ book, onPreview, onEdit, onDelete, getCoverConfig }) => {
  const coverConfig = getCoverConfig(book);
  const isGradientClass = coverConfig?.gradient && (coverConfig.gradient.startsWith("bg-") || coverConfig.gradient.includes("from-"));

  // Retrieve category from serialized description
  const getCategory = (b) => {
    if (!b.description) return "eBook";
    const match = b.description.match(/Category:\s*(.+)/);
    return match ? match[1] : "eBook";
  };

  return (
    <div className="relative aspect-square rounded-[16px] overflow-hidden border border-border-primary shadow-lg group select-none bg-bg-secondary transition-colors duration-250">
      {/* Background image or gradient filling the square card */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110"
        style={{
          backgroundImage: coverConfig?.imageUrl ? `url(${coverConfig.imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          background: coverConfig?.imageUrl ? undefined : (isGradientClass ? undefined : (coverConfig?.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)")),
        }}
      >
        {/* Spine crease shadow */}
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-black/35 via-white/5 to-transparent z-10"></div>
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/25 z-0"></div>
      </div>

      {/* Card Contents (Visible at normal state) */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
        {/* Top Tag and Badge */}
        <div className="flex justify-between items-start gap-2">
          {/* Category Badge */}
          <span className="bg-bg-primary/80 backdrop-blur-md text-text-primary border border-border-primary px-2 py-0.5 rounded-full font-sans text-[8px] uppercase font-bold tracking-wider truncate max-w-[70%]">
            {getCategory(book)}
          </span>
          
          {/* Status Tag */}
          <span className={`px-2 py-0.5 rounded-full font-mono text-[8px] uppercase font-bold tracking-wide border ${
            book.isPublished 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
              : "bg-bg-primary/80 text-text-muted border-border-primary"
          }`}>
            {book.isPublished ? "Published" : "Draft"}
          </span>
        </div>

        {/* Bottom Title Overlay */}
        <div>
          <h4 className="font-sans font-bold text-xs sm:text-sm text-white leading-tight line-clamp-2 drop-shadow-md">
            {book.title}
          </h4>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          {/* Preview */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onPreview(book._id);
            }}
            className="w-9 h-9 rounded-full bg-bg-tertiary hover:bg-accent-primary text-text-primary hover:text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-md text-sm border border-border-primary"
            title="Preview eBook"
          >
            👁
          </button>
          
          {/* Edit */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(book._id);
            }}
            className="w-9 h-9 rounded-full bg-bg-tertiary hover:bg-accent-primary text-text-primary hover:text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-md text-sm border border-border-primary"
            title="Edit eBook"
          >
            ✏️
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(book._id, e);
            }}
            className="w-9 h-9 rounded-full bg-bg-tertiary hover:bg-rose-500 text-text-primary hover:text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-md text-sm border border-border-primary"
            title="Delete eBook"
          >
            🗑️
          </button>
        </div>
        <span className="text-[8px] uppercase tracking-widest font-extrabold text-zinc-400">Actions</span>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  // Edit profile states
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  useEffect(() => {
    fetchAuthorStats();
    if (user) {
      setEditUsername(user.username || "");
      setEditBio(user.bio || "AI & Data Science Student. Passionate about AI, Writing and Technology.");
      setEditLocation(user.location || "Jaipur, India");
      setEditAvatar(user.avatar || "");
    }
  }, [user]);

  const fetchAuthorStats = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (err) {
      console.error("Could not load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleDeleteBook = async (bookId, e) => {
    if (e) e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this eBook? This action is permanent and will delete all pages/chapters.")) return;

    const token = localStorage.getItem("token");
    const toastId = toast.loading("Deleting eBook...");
    try {
      const response = await fetch(`http://localhost:5000/api/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete eBook");
      }

      toast.success("eBook deleted successfully!", { id: toastId });
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not delete eBook.", { id: toastId });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("token");
    const toastId = toast.loading("Uploading image...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEditAvatar(data.url);
        toast.success("Profile picture uploaded successfully!", { id: toastId });
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Failed to upload image", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not upload profile picture.", { id: toastId });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername,
          bio: editBio,
          location: editLocation,
          avatar: editAvatar,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        toast.success("Profile updated successfully!");
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile edit error:", err);
      toast.error("Could not save profile details.");
    }
  };

  // Stats calculation
  const totalBooks = books.length;
  const publishedBooks = books.filter((b) => b.isPublished).length;
  const draftBooks = books.filter((b) => !b.isPublished).length;

  let totalWordsWritten = 0;
  books.forEach((b) => {
    if (b.chapters) {
      b.chapters.forEach((ch) => {
        if (ch.body) {
          const cleanText = ch.body.replace(/<!-- pagebreak -->/g, " ").replace(/<[^>]*>/g, " ");
          totalWordsWritten += cleanText.trim().split(/\s+/).filter((w) => w.length > 0).length;
        }
      });
    }
  });

  const getMemberSince = () => {
    if (!user?.createdAt) return "June 2026";
    const date = new Date(user.createdAt);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getProfileCompletion = () => {
    let score = 40; // Base details
    if (user?.bio && user.bio.length > 10) score += 20;
    if (user?.avatar) score += 20;
    if (user?.location && user.location !== "Jaipur, India") score += 10;
    if (totalWordsWritten > 100) score += 10;
    return Math.min(100, score);
  };

  const getCoverConfig = (book) => {
    let parsedConfig = {
      gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      style: "modern",
      subtitle: "FIRST EDITION",
      imageUrl: "",
    };
    if (!book) return parsedConfig;
    try {
      if (book.coverImage) {
        const parsed = JSON.parse(book.coverImage);
        if (parsed.gradient || parsed.imageUrl) {
          parsedConfig = { ...parsedConfig, ...parsed };
        }
      }
    } catch (e) {
      if (book.coverImage && (book.coverImage.startsWith("linear-gradient") || book.coverImage.startsWith("from-"))) {
        parsedConfig.gradient = book.coverImage;
      }
    }
    return parsedConfig;
  };

  const getBookAvgRating = (bk) => {
    if (!bk?.reviews || bk.reviews.length === 0) return "0.0";
    const sum = bk.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / bk.reviews.length).toFixed(1);
  };

  const getPopularBook = () => {
    if (books.length === 0) return null;
    const sorted = [...books].sort((a, b) => (b.reads || 0) - (a.reads || 0));
    return sorted[0];
  };

  const popularBook = getPopularBook();
  const displayInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "W";

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col justify-start transition-colors duration-250">
      
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header */}
      <header className="h-16 bg-bg-secondary border-b border-border-primary px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-250">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            to="/dashboard"
            className="text-text-muted hover:text-text-primary transition-colors uppercase tracking-widest font-mono"
          >
            Library
          </Link>
          <span className="text-border-primary font-mono">&gt;</span>
          <span className="text-text-primary uppercase tracking-widest font-mono">
            Profile
          </span>
        </div>

        {/* Right Options */}
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all mr-1 ${
              user?.subscriptionTier === "pro"
                ? "bg-amber-500/10 text-amber-600 border-amber-500/25 hover:bg-amber-500/20"
                : user?.subscriptionTier === "premium"
                  ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/25 hover:bg-[#8B5CF6]/20"
                  : user?.subscriptionTier === "lifetime"
                    ? "bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25"
                    : "bg-bg-primary text-text-muted border-border-primary hover:bg-bg-tertiary"
            }`}
          >
            {user?.subscriptionTier === "pro"
              ? "⭐ Pro Plan"
              : user?.subscriptionTier === "premium"
                ? "💎 Premium"
                : user?.subscriptionTier === "lifetime"
                  ? "💎 Lifetime"
                  : "Free Plan"}
          </Link>
          <button
            onClick={() => setActiveTab("Settings")}
            className="h-8 px-4 bg-transparent hover:bg-bg-secondary border border-border-primary hover:border-text-primary text-xs font-bold tracking-wider rounded-lg transition-all text-text-secondary hover:text-text-primary cursor-pointer"
          >
            Edit Profile
          </button>
          
          <button
            onClick={() => setActiveTab("Settings")}
            className="w-8 h-8 rounded-lg border border-border-primary hover:border-text-primary flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all cursor-pointer"
            title="Settings"
          >
            ⚙️
          </button>

          <button
            onClick={() => {
              toast("Writer Hub profile is fully synced.", { icon: "✓" });
            }}
            className="w-8 h-8 rounded-lg border border-border-primary hover:border-text-primary flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all cursor-pointer font-bold"
            title="More Options"
          >
            •••
          </button>

          <button
            onClick={handleLogoutClick}
            className="h-8 px-4 bg-transparent border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-500 hover:text-red-700 active:scale-[0.98] text-[10px] font-bold tracking-wider rounded-lg transition-all uppercase cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-[1000px] w-full mx-auto p-6 sm:p-8 flex flex-col gap-6 animate-fadeIn">
        
        {/* Profile Header */}
        <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-xs flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition-colors duration-250">
          <div className="flex gap-4 items-center">
            {/* Circular Avatar with upload icon overlay */}
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => fileInputRef.current?.click()}
              title="Upload Avatar"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-20 w-20 rounded-full object-cover border border-border-primary shadow-xs"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-accent-primary to-accent-ring text-white flex items-center justify-center font-display font-light text-2xl shadow-sm">
                  {displayInitials}
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/55 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs">
                📷
              </div>
            </div>

            <div>
              {/* Full Name */}
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-text-primary">
                {user?.username || "Sandeep Choudhary"}
              </h1>
              
              {/* Bio & Details */}
              <p className="text-xs text-text-secondary font-normal leading-relaxed max-w-[350px] mt-1">
                {user?.bio || "AI & Data Science Student. Passionate about AI, Writing and Technology."}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-text-muted font-semibold">
                <span>📍 {user?.location || "Jaipur, India"}</span>
                <span className="text-border-primary">•</span>
                <span>📅 Member Since {getMemberSince()}</span>
              </div>
            </div>
          </div>

          {/* Stats Badges row */}
          <div className="flex gap-2.5 bg-bg-primary border border-border-primary rounded-xl p-3 md:self-center transition-colors duration-250">
            <div className="text-center px-4 py-1.5 border-r border-border-primary">
              <span className="text-[10px] text-text-muted block font-mono">Books</span>
              <span className="text-sm font-bold text-text-primary">{totalBooks.toString().padStart(2, "0")}</span>
            </div>
            <div className="text-center px-4 py-1.5 border-r border-border-primary">
              <span className="text-[10px] text-text-muted block font-mono">Published</span>
              <span className="text-sm font-bold text-emerald-500">{publishedBooks.toString().padStart(2, "0")}</span>
            </div>
            <div className="text-center px-4 py-1.5">
              <span className="text-[10px] text-text-muted block font-mono">Drafts</span>
              <span className="text-sm font-bold text-text-secondary">{draftBooks.toString().padStart(2, "0")}</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="border-b border-border-primary">
          <div className="flex gap-6 text-xs pl-1">
            {["Overview", "My Library", "Achievements", "Bookmarks", "Settings"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "text-text-primary border-b-2 border-accent-primary font-bold"
                      : "text-text-muted hover:text-text-primary border-b-2 border-transparent"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tab Contents: Overview */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column */}
            <div className="md:col-span-5 flex flex-col gap-6">
              
              {/* About Me Card */}
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 shadow-xs transition-colors duration-250">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted block mb-3 pl-0.5">
                  About Me
                </span>
                <p className="text-xs text-text-secondary font-normal leading-relaxed pl-0.5">
                  {user?.bio ? (
                    user.bio
                  ) : (
                    <>
                      AI & Science Student passionate about AI, Writing and Technology.<br />
                      Currently building AI powered publishing tools.
                    </>
                  )}
                </p>
              </div>

              {/* Subscription Details Card */}
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 shadow-xs transition-colors duration-250 flex flex-col gap-4">
                <div className="flex items-center justify-between pl-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
                    Subscription & Billing
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                    user?.subscriptionTier === "pro"
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : user?.subscriptionTier === "premium"
                        ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20"
                        : user?.subscriptionTier === "lifetime"
                          ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                          : "bg-bg-primary text-text-muted border border-border-primary"
                  }`}>
                    {user?.subscriptionTier ? user.subscriptionTier.toUpperCase() : "FREE"} PLAN
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-[11px] font-semibold text-text-secondary pl-0.5">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="opacity-75">Next Billing</span>
                    <span className="text-text-primary font-mono font-bold">
                      {user?.subscriptionTier === "lifetime" 
                        ? "Never (Lifetime)" 
                        : user?.subscriptionExpiresAt 
                          ? new Date(user.subscriptionExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "July 20, 2026"}
                    </span>
                  </div>
                  <div className="w-full h-px bg-border-primary/50"></div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="opacity-75">Books Created</span>
                    <span className="text-text-primary font-mono font-bold">{totalBooks} / {user?.subscriptionTier === "free" ? "2" : "Unlimited"}</span>
                  </div>
                  <div className="w-full h-px bg-border-primary/50"></div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="opacity-75">AI Generations</span>
                    <span className="text-text-primary font-mono font-bold">
                      {user?.subscriptionTier === "free" ? "0 / 5" : "Unlimited (∞)"}
                    </span>
                  </div>
                  <div className="w-full h-px bg-border-primary/50"></div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="opacity-75">EPUB/PDF Exports</span>
                    <span className="text-text-primary font-mono font-bold">
                      {user?.subscriptionTier === "free" ? "1 / 2" : "Unlimited (∞)"}
                    </span>
                  </div>
                </div>

                <Link
                  to="/pricing"
                  className="w-full h-9 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white active:scale-[0.98] rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer shadow-md shadow-[#8B5CF6]/10"
                >
                  Manage Subscription
                </Link>
              </div>

            </div>

            {/* Right Column */}
            <div className="md:col-span-7 flex flex-col gap-6">
              
              {/* Most Popular Book */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted block pl-0.5">
                  Most Popular Book
                </span>

                {books.length > 0 && popularBook ? (
                  <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 shadow-xs flex flex-col sm:flex-row gap-5 items-center relative overflow-hidden transition-colors duration-250">
                    {/* Book Cover */}
                    <div className="w-[100px] sm:w-[85px] shrink-0 self-stretch flex items-center justify-center">
                      <div className="w-full aspect-[3/4.2] rounded-[6px] overflow-hidden shadow-md">
                        <BookShelfCover config={getCoverConfig(popularBook)} title={popularBook?.title || ""} className="hover:scale-100 aspect-[3/4.2]" />
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 flex flex-col justify-between h-full w-full">
                      <div className="mb-3">
                        {/* Category */}
                        <span className="bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-2 py-0.5 rounded-full font-mono text-[8px] uppercase font-bold tracking-wider inline-block mb-1.5">
                          {popularBook?.description?.split("\n")[0]?.replace("Category: ", "") || "Technology"}
                        </span>

                        {/* Title */}
                        <h3 className="font-sans font-bold text-base text-text-primary leading-snug line-clamp-2 mb-1.5">
                          {popularBook?.title || "eBook Title"}
                        </h3>

                        {/* Reads & Rating */}
                        <div className="flex items-center gap-3 text-[10px] font-bold text-text-muted uppercase tracking-wide">
                          <span>👁 {popularBook?.reads || 0} Reads</span>
                          <span className="text-border-primary">|</span>
                          <span className="text-amber-555 dark:text-amber-400">★ {getBookAvgRating(popularBook)} Rating</span>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <div>
                        <Link
                          to={`/editor?bookId=${popularBook?._id}`}
                          className="inline-flex items-center gap-1.5 h-8 px-4 bg-accent-primary hover:bg-accent-hover text-white active:scale-[0.98] rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all shadow-md shadow-accent-primary/10"
                        >
                          ✍️ Continue Reading
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-bg-secondary border border-border-primary rounded-xl p-8 text-center text-text-muted text-xs font-medium transition-colors duration-250">
                    No books created yet. Start by writing your first book!
                  </div>
                )}
              </div>

              {/* Writing Achievements Grid */}
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 shadow-xs transition-colors duration-250">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted block mb-4 pl-0.5">
                  Writing Achievements
                </span>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "🏆", title: "First Book", active: books.length > 0 },
                    { icon: "🔥", title: "10 Day Streak", active: (user?.streak || 12) >= 10 },
                    { icon: "📚", title: "Published Author", active: publishedBooks > 0 },
                    { icon: "✍️", title: "10K Words", active: totalWordsWritten >= 10000 },
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                        badge.active
                          ? "bg-accent-primary/10 border-accent-primary text-text-primary shadow-xs"
                          : "bg-bg-secondary border-border-primary opacity-35 blur-[0.5px] text-text-muted"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{badge.icon}</span>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider">
                        {badge.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab Contents: My Library */}
        {activeTab === "My Library" && (
          <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 sm:p-8 shadow-xs flex flex-col gap-6 transition-colors duration-250">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted block mb-1">
                My Library Shelf
              </span>
              <p className="text-[10px] text-text-muted">Instagram creator post grid style</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 gap-[20px]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-bg-tertiary/20 border border-border-primary rounded-[16px] animate-pulse" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 bg-transparent border border-dashed border-border-primary rounded-[16px] flex flex-col items-center justify-center p-6">
                <span className="text-text-secondary text-xs font-semibold block mb-4">
                  You haven't created enough books yet.
                </span>
                <button
                  onClick={() => navigate("/dashboard", { state: { openCreateModal: true } })}
                  className="px-5 py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-[10px] font-extrabold uppercase tracking-wider rounded-[16px] transition-all shadow-md shadow-accent-primary/10 cursor-pointer"
                >
                  + Create New eBook
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-[20px]">
                {books.map((book) => (
                  <LibraryGridCard
                    key={book._id}
                    book={book}
                    onPreview={(id) => navigate(`/view-book/${id}`)}
                    onEdit={(id) => navigate(`/editor?bookId=${id}`)}
                    onDelete={handleDeleteBook}
                    getCoverConfig={getCoverConfig}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab Contents: Achievements */}
        {activeTab === "Achievements" && (
          <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-xs flex flex-col gap-6 transition-colors duration-250">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted block mb-1">
                Author Achievements
              </span>
              <p className="text-[10px] text-text-muted">Review milestones and unlocked badges</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "🏆", title: "First Book", desc: "Successfully created your first eBook layout.", active: books.length > 0 },
                { icon: "🔥", title: "10 Day Streak", desc: "Write consistently for 10 days in a row.", active: (user?.streak || 12) >= 10 },
                { icon: "📚", title: "Published Author", desc: "Make at least one eBook public in discover.", active: publishedBooks > 0 },
                { icon: "✍️", title: "10K Words Written", desc: "Reach 10,005 accumulated words across drafts.", active: totalWordsWritten >= 10000 },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 p-4 rounded-xl border items-center transition-all ${
                    badge.active
                      ? "bg-accent-primary/10 border-accent-primary text-text-primary shadow-xs"
                      : "bg-bg-secondary border-border-primary opacity-35 blur-[0.4px] text-text-muted"
                  }`}
                >
                  <span className="text-4xl shrink-0">{badge.icon}</span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-text-primary">{badge.title}</h4>
                    <p className="text-[10px] text-text-secondary mt-1">{badge.desc}</p>
                    <span className="inline-block mt-2 font-mono text-[8px] bg-bg-tertiary px-2 py-0.5 rounded uppercase tracking-wider font-semibold text-text-secondary">
                      {badge.active ? "Unlocked ✓" : "Locked 🔒"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab Contents: Bookmarks */}
        {activeTab === "Bookmarks" && (
          <section className="bg-bg-secondary border border-border-primary rounded-xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[220px] transition-colors duration-250">
            <span className="text-3xl mb-3">🔖</span>
            <h3 className="font-sans font-semibold text-sm text-text-primary mb-1">
              Your Bookmarked Drafts
            </h3>
            <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
              You haven't bookmarked any books yet. Save your favorite drafts or published works here.
            </p>
          </section>
        )}

        {/* Tab Contents: Settings */}
        {activeTab === "Settings" && (
          <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-xs max-w-xl mx-auto w-full transition-colors duration-250">
            <div>
              <h3 className="font-sans font-semibold text-lg text-text-primary">
                Profile Settings
              </h3>
              <p className="text-[9px] text-text-muted font-semibold uppercase tracking-wider mt-0.5 mb-4">
                Update your public profile configuration
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-text-primary">
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                  Author Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs outline-none text-text-primary font-medium focus:border-accent-primary transition-colors duration-250"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Jaipur, India"
                  className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs outline-none text-text-primary font-medium focus:border-accent-primary transition-colors duration-250"
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                  About / Biography
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows="3"
                  className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs outline-none text-text-primary resize-none leading-relaxed focus:border-accent-primary transition-colors duration-250"
                />
              </div>

              {/* Avatar upload shortcut */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                  Profile Picture
                </label>
                
                <div className="flex items-center gap-3 bg-bg-primary border border-border-primary rounded-xl p-3 transition-colors duration-250">
                  <div className="shrink-0">
                    {editAvatar ? (
                      <img
                        src={editAvatar}
                        alt="Preview"
                        className="h-12 w-12 rounded-full object-cover border border-border-primary shadow-xs"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center text-xs font-bold font-mono">
                        {displayInitials}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-border-primary bg-bg-secondary text-text-primary hover:bg-accent-primary hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Choose Avatar Image
                    </button>
                    <span className="text-[8px] text-text-muted">PNG, JPG up to 5MB</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="Or paste image URL directly..."
                  className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-1.5 text-[10px] outline-none text-text-primary font-mono focus:border-accent-primary transition-colors duration-250"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border-primary">
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        )}

      </main>

    </div>
  );
};

export default ProfilePage;
