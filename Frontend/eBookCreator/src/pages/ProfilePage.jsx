import React, { useState, useEffect } from "react";
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

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Profile Avatar Upload handler
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

  // Profile Save handler
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
        setIsEditModalOpen(false);
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile edit error:", err);
      toast.error("Could not save profile details.");
    }
  };

  // Preference Theme update
  const handleThemePreference = async (newTheme) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredTheme: newTheme }),
      });
      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        toast.success(`Theme preference set to ${newTheme}!`);
      }
    } catch (err) {
      console.error(err);
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
    let score = 40; // Default base for user credentials
    if (user?.bio && user.bio.length > 10) score += 20;
    if (user?.avatar) score += 20;
    if (user?.location && user.location !== "Jaipur, India") score += 10;
    if (totalWordsWritten > 100) score += 10;
    return Math.min(100, score);
  };

  // Find book cover config helper
  const getCoverConfig = (book) => {
    let parsedConfig = {
      gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      style: "modern",
      subtitle: "FIRST EDITION",
      imageUrl: "",
    };
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

  // Get average rating of a book helper
  const getBookAvgRating = (bk) => {
    if (!bk?.reviews || bk.reviews.length === 0) return "0.0";
    const sum = bk.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / bk.reviews.length).toFixed(1);
  };

  // Get most popular book based on reads count
  const getPopularBook = () => {
    if (books.length === 0) {
      return { title: "Introduction to Artificial Intelligence", reads: 0 };
    }
    const sorted = [...books].sort((a, b) => (b.reads || 0) - (a.reads || 0));
    return sorted[0];
  };

  const popularBook = getPopularBook();

  // Total Reads across all books
  const totalReads = books.reduce((acc, b) => acc + (b.reads || 0), 0);

  // Average rating across all reviews of all books
  const getAverageAuthorRating = () => {
    let reviewCount = 0;
    let ratingSum = 0;
    books.forEach((b) => {
      if (b.reviews) {
        b.reviews.forEach((r) => {
          ratingSum += r.rating;
          reviewCount += 1;
        });
      }
    });
    return reviewCount > 0 ? (ratingSum / reviewCount).toFixed(1) : "0.0";
  };

  const avgAuthorRating = getAverageAuthorRating();
  const totalReviewsCount = books.reduce((acc, b) => acc + (b.reviews?.length || 0), 0);

  const displayInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "W";

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col justify-start transition-colors duration-250">
      
      {/* Sticky Header */}
      <header className="h-16 bg-bg-secondary border-b border-border-primary px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 transition-colors duration-250">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Library
          </Link>
          <span className="text-border-primary">|</span>
          <span className="text-text-primary text-xs font-semibold">
            Writer Hub Profile
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <button
            onClick={handleLogoutClick}
            className="h-[34px] px-4 bg-transparent border border-rose-200 hover:border-rose-500 hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 active:scale-[0.98] text-[10px] font-bold tracking-wider rounded-lg transition-all uppercase cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container Canvas */}
      <main className="flex-grow max-w-[1000px] w-full mx-auto p-6 sm:p-8 flex flex-col gap-8 animate-fadeIn">
        
        {/* Dream Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Profile Information Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Card 1: Profile Card */}
            <section className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
              
              {/* Avatar section */}
              <div className="relative mt-3 mb-4 group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-24 w-24 rounded-full object-cover border-2 border-slate-100 shadow-md group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-650 via-violet-600 to-fuchsia-500 text-white flex items-center justify-center font-display font-light text-3xl tracking-wide shadow-lg shadow-indigo-500/10">
                    {displayInitials}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center text-[10px] shadow-sm">
                  ✏️
                </div>
              </div>

              <h2 className="font-display font-light text-2xl text-slate-900 leading-tight mb-1">
                {user?.username || "Writer Profile"}
              </h2>

              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-3">
                📍 {user?.location || "Jaipur, India"}
              </span>

              {/* Bio description */}
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed max-w-[220px] mb-5">
                {user?.bio || "AI & Data Science Student. Passionate about AI, Writing and Technology."}
              </p>

              <div className="w-full h-px bg-slate-100 my-4"></div>

              {/* Stats table */}
              <div className="w-full flex flex-col gap-2 text-left text-[11px] font-medium text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Member Since</span>
                  <span className="text-slate-800 font-semibold font-mono">{getMemberSince()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Account Status</span>
                  <span className="bg-emerald-50 text-emerald-750 border border-emerald-100 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase font-extrabold">
                    {user?.role === "admin" ? "Platform Admin" : "Premium Writer"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full mt-5 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 active:scale-[0.98] rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
              >
                Edit Bio Details
              </button>
            </section>

            {/* Card 2: Profile Completion Progress */}
            <section className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  Profile Completion
                </span>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {getProfileCompletion()}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${getProfileCompletion()}%` }}
                />
              </div>

              <ul className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <li className="flex items-center gap-2">
                  <span className={user?.avatar ? "text-emerald-500" : "text-slate-300"}>
                    {user?.avatar ? "✓" : "○"}
                  </span>
                  <button onClick={() => setIsEditModalOpen(true)} className="hover:text-slate-800 hover:underline cursor-pointer">
                    Upload Custom Avatar
                  </button>
                </li>
                <li className="flex items-center gap-2">
                  <span className={user?.bio ? "text-emerald-500" : "text-slate-300"}>
                    {user?.bio ? "✓" : "○"}
                  </span>
                  <button onClick={() => setIsEditModalOpen(true)} className="hover:text-slate-800 hover:underline cursor-pointer">
                    Refine Biography
                  </button>
                </li>
                <li className="flex items-center gap-2">
                  <span className={books.length > 0 ? "text-emerald-500" : "text-slate-300"}>
                    {books.length > 0 ? "✓" : "○"}
                  </span>
                  <Link to="/dashboard" className="hover:text-slate-800 hover:underline">
                    Create First Draft
                  </Link>
                </li>
              </ul>
            </section>

            {/* Card 3: Reader Preferences */}
            <section className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-xs flex flex-col gap-4">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                Reader Preferences
              </span>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                  Favorite Reading Theme
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "light", icon: "🌞", label: "Light", color: "bg-slate-50 border-slate-200 text-slate-700" },
                    { name: "sepia", icon: "📜", label: "Sepia", color: "bg-[#F5EFE0] border-[#EADFCA] text-[#4E3629]" },
                    { name: "dark", icon: "🌙", label: "Dark", color: "bg-[#18181B] border-zinc-800 text-zinc-300" },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleThemePreference(item.name)}
                      className={`py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${item.color} ${
                        (user?.preferredTheme || "light") === item.name
                          ? "ring-2 ring-indigo-500 scale-102 font-bold"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT SIDE: Statistics, Streak, Badges & Shelf */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Row 1: Achievement Grid & Writing Streak */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Writing Streak 🔥 widget */}
              <div className="md:col-span-5 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-[24px] p-6 shadow-md shadow-orange-500/10 flex flex-col justify-between aspect-[4/3] md:aspect-auto md:h-full min-h-[160px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-100/90">
                    🔥 Writing Streak
                  </span>
                  <span className="text-xl">⚡</span>
                </div>
                <div className="my-auto">
                  <h3 className="font-display font-light text-4xl tracking-tight leading-none">
                    {user?.streak || 12} Days
                  </h3>
                  <p className="text-[10px] text-amber-100 font-semibold uppercase tracking-wider mt-1.5">
                    Keep writing everyday!
                  </p>
                </div>
              </div>

              {/* Achievements Badges section */}
              <div className="md:col-span-7 bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 block">
                  Achievements Badges
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "🏆", title: "First Book", active: books.length > 0, desc: "Created an outline" },
                    { icon: "🔥", title: "10 Day Streak", active: (user?.streak || 12) >= 10, desc: "Active writing streak" },
                    { icon: "✍", title: "10k Words", active: totalWordsWritten >= 10000, desc: "Total cumulative words" },
                    { icon: "📚", title: "Published", active: publishedBooks > 0, desc: "Made a book public" },
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        badge.active
                          ? "bg-indigo-50/40 border-indigo-100/60 text-slate-800"
                          : "bg-slate-50/50 border-slate-100 opacity-40 text-slate-400"
                      }`}
                    >
                      <span className="text-xl shrink-0">{badge.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider truncate">
                          {badge.title}
                        </h4>
                        <span className="text-[8px] opacity-70 block truncate leading-none mt-0.5">
                          {badge.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Row 2: Standard Stats & Popular Book */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Stats Grid */}
              <div className="md:col-span-7 grid grid-cols-2 gap-3">
                {[
                  { label: "Total eBooks", value: totalBooks, color: "text-slate-800" },
                  { label: "Published Books", value: publishedBooks, color: "text-emerald-600" },
                  { label: "Drafts", value: draftBooks, color: "text-slate-600" },
                  { label: "Total Words", value: totalWordsWritten, color: "text-indigo-650", isWords: true },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-slate-150/60 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      {stat.label}
                    </span>
                    <span className={`font-display font-light text-2xl mt-2 block ${stat.color}`}>
                      {stat.isWords
                        ? (stat.value > 10000 ? `${Math.round(stat.value / 1000)}k` : stat.value.toLocaleString())
                        : stat.value.toString().padStart(2, "0")
                      }
                    </span>
                  </div>
                ))}
              </div>

              {/* Most Popular Book Card */}
              <div className="md:col-span-5 bg-white border border-[#E5E7EB] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
                  Most Popular Book
                </span>
                
                <div className="flex items-center gap-3 py-1">
                  <div className="w-[50px] shrink-0">
                    <BookShelfCover config={getCoverConfig(popularBook)} title={popularBook?.title || ""} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-medium text-xs text-slate-900 leading-snug line-clamp-2">
                      {popularBook?.title || "eBook Title"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-slate-455 uppercase tracking-wide">
                      <span className="flex items-center gap-0.5">👁 {popularBook?.reads || 0} Reads</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-amber-500">★ {getBookAvgRating(popularBook)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 3: Reading Analytics & Monthly Progress Chart */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Reading Analytics */}
              <div className="md:col-span-5 bg-white border border-[#E5E7EB] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-3">
                  Reading Analytics
                </span>
                
                <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="opacity-75">Total Reads</span>
                    <span className="text-slate-900 font-mono font-extrabold">{totalReads}</span>
                  </div>
                  <div className="w-full h-px bg-slate-50"></div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="opacity-75">Est. Pages Written</span>
                    <span className="text-slate-900 font-mono font-extrabold">
                      {totalWordsWritten > 0 ? Math.round(totalWordsWritten / 250) : 0}
                    </span>
                  </div>
                  <div className="w-full h-px bg-slate-50"></div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="opacity-75">Avg Rating</span>
                    <span className="text-indigo-650 font-mono font-extrabold">
                      ★ {avgAuthorRating} ({totalReviewsCount} Reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Chart 📈 */}
              <div className="md:col-span-7 bg-white border border-[#E5E7EB] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-4">
                  Words Written (Words/Month)
                </span>
                
                {/* Horizontal CSS Graph */}
                <div className="flex flex-col gap-3">
                  {[
                    { month: "Jan", words: 2500, percent: "w-[30%]", color: "bg-slate-300" },
                    { month: "Feb", words: 5800, percent: "w-[65%]", color: "bg-slate-400" },
                    { month: "Mar", words: 7200, percent: "w-[85%]", color: "bg-indigo-500 shadow-xs shadow-indigo-500/10" },
                    { month: "Apr", words: 4100, percent: "w-[48%]", color: "bg-slate-450" },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-7 font-mono">{bar.month}</span>
                      <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                        <div className={`h-full rounded-full transition-all duration-500 ${bar.color} ${bar.percent}`}></div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 font-mono w-10 text-right">
                        {bar.words.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Row 4: Recent Activity & Export History */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Recent Activity Section */}
              <div className="md:col-span-6 bg-white border border-[#E5E7EB] rounded-[24px] p-5 shadow-xs">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-4">
                  Recent Activity Log
                </span>
                
                {/* Notion Style Logs list */}
                <div className="flex flex-col gap-3 font-semibold text-[10px] text-slate-650 pl-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 text-xs">✓</span>
                    <span>Created book catalog outline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 text-xs">✓</span>
                    <span>Generated Chapter 1 content drafts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 text-xs">✓</span>
                    <span>Updated Cover gradient design layout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 text-xs">✓</span>
                    <span>Exported PDF complete book payload</span>
                  </div>
                </div>
              </div>

              {/* Export History */}
              <div className="md:col-span-6 bg-white border border-[#E5E7EB] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-4">
                    Recent Downloads
                  </span>
                  
                  <div className="flex flex-col gap-2 font-mono text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span>📄 Book_Outline.pdf</span>
                      <span className="text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded font-semibold text-[8px]">PDF</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span>📖 Final_Draft.epub</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[8px]">EPUB</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span>📝 Manuscript_Ch1.docx</span>
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[8px]">DOCX</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Shelf Books Catalog Container ⭐⭐⭐⭐⭐ */}
        <section className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 shadow-xs flex flex-col gap-5 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              My Library Shelf
            </span>
            <Link to="/dashboard" className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">
              Manage eBooks →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4.2] bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
              <span className="text-slate-400 text-xs font-semibold block mb-2">No books on your shelf yet</span>
              <Link
                to="/dashboard"
                className="inline-block px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                + Create Your First eBook
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {books.map((book) => (
                <Link
                  key={book._id}
                  to={`/editor?bookId=${book._id}`}
                  className="flex flex-col gap-2 group"
                  title={`Edit "${book.title}"`}
                >
                  <BookShelfCover config={getCoverConfig(book)} title={book.title} />
                  <span className="text-[9px] font-semibold text-slate-700 truncate block text-center group-hover:text-slate-900 group-hover:underline">
                    {book.title}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 text-[8px] font-mono text-slate-400">
                    <span>👁 {book.reads || 0}</span>
                    <span>★ {book.reviews?.length > 0 ? (book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length).toFixed(1) : "0.0"}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* MODAL: Profile Details Editor */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-[24px] border border-slate-200 w-full max-w-[420px] shadow-2xl p-6 flex flex-col gap-4 animate-scaleUp text-slate-800"
          >
            <div>
              <h3 className="font-display font-light text-xl text-slate-900">
                Edit Bio Details
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Update your public author profile details
              </p>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Input 1: Username */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest pl-1">
                Author Username
              </label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
                placeholder="Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none text-slate-750 font-medium"
              />
            </div>

            {/* Input 2: Avatar File Upload & URL */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest pl-1">
                Profile Picture
              </label>
              
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="shrink-0">
                  {editAvatar ? (
                    <img
                      src={editAvatar}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover border border-slate-250 shadow-sm"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-750 flex items-center justify-center text-xs font-bold font-mono">
                      {displayInitials}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full"
                  />
                  <span className="text-[8px] text-slate-400">PNG, JPG up to 5MB</span>
                </div>
              </div>

              {/* Paste URL option */}
              <input
                type="text"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="Or paste image URL directly..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] outline-none text-slate-700 font-mono"
              />
            </div>

            {/* Input 3: Location */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest pl-1">
                Location
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g. Jaipur, India"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none text-slate-750 font-medium"
              />
            </div>

            {/* Input 4: Biography */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest pl-1">
                About / Biography
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows="3"
                placeholder="Tell readers about yourself..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none text-slate-750 font-medium resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-800 text-slate-650 hover:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-blue-600/10"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
