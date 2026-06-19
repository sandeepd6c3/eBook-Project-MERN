import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import toast from "react-hot-toast";

// Reusable Book Cover
const DiscoverBookCover = ({ config, title, author, className = "" }) => {
  const isGradientClass = config?.gradient && (config.gradient.startsWith("bg-") || config.gradient.includes("from-"));

  return (
    <div
      className={`relative rounded-r-md shadow-lg overflow-hidden border-l-[3px] border-black/30 flex flex-col justify-between p-3.5 aspect-[3/4.2] text-white hover:scale-103 transition-transform duration-300 ${className}`}
      style={{
        backgroundImage: config?.imageUrl ? `url(${config.imageUrl})` : undefined,
        backgroundSize: config?.imageUrl ? "cover" : undefined,
        backgroundPosition: config?.imageUrl ? "center" : undefined,
        background: config?.imageUrl ? undefined : (isGradientClass ? undefined : (config?.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)")),
      }}
    >
      {/* Crease spine shadow */}
      <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-black/25 via-white/5 to-transparent z-10"></div>
      
      {/* Readability overlay */}
      {config?.imageUrl && <div className="absolute inset-0 bg-black/45 z-0"></div>}

      <div className="relative z-10 w-full h-full flex flex-col justify-between text-left">
        <span className="text-[6px] tracking-widest uppercase opacity-75 bg-black/10 inline-block px-1.5 py-0.5 rounded-full font-mono self-start">
          {config?.style?.toUpperCase() || "MODERN"}
        </span>
        <h4 className="font-display font-medium text-xs sm:text-sm leading-tight text-white line-clamp-3">
          {title}
        </h4>
        <div className="text-[8px] font-semibold tracking-wider border-t border-white/20 pt-1 truncate w-full">
          BY {author?.toUpperCase() || "WRITER"}
        </div>
      </div>
    </div>
  );
};

const DiscoverPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Newest");

  const categories = ["All", "Tech", "Business", "Science", "Fiction", "Design", "Academic"];

  useEffect(() => {
    fetchPublicBooks();
  }, [selectedCategory, selectedSort]);

  const fetchPublicBooks = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const url = `http://localhost:5000/api/books/public?search=${encodeURIComponent(searchText)}&category=${encodeURIComponent(selectedCategory)}&sort=${encodeURIComponent(selectedSort)}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        toast.error("Could not fetch public library catalog.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading catalog.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPublicBooks();
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Find book cover helper
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

  // Get average rating helper
  const getAvgRating = (bk) => {
    if (!bk.reviews || bk.reviews.length === 0) return 0;
    const sum = bk.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / bk.reviews.length).toFixed(1);
  };

  // Get category from description helper
  const extractCategory = (desc) => {
    if (!desc) return "General";
    const match = desc.match(/Category:\s*([^\n|]+)/i);
    return match ? match[1].trim() : "General";
  };

  const displayInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "W";

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col justify-start transition-colors duration-250">
      
      {/* Sticky Navigation Header */}
      <header className="h-16 bg-bg-secondary border-b border-border-primary px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 shrink-0 text-text-primary transition-colors duration-250">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-text-primary text-sm font-semibold tracking-tight hover:opacity-80"
          >
            📚 eBook Creator
          </Link>
          <span className="text-border-primary">|</span>
          <nav className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">
            <Link to="/dashboard" className="hover:text-text-primary transition-colors">
              Library
            </Link>
            <Link to="/discover" className="text-accent-primary transition-colors">
              Discover
            </Link>
            <Link to="/profile" className="hover:text-text-primary transition-colors">
              Profile
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Link
            to="/profile"
            className="h-8 w-8 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-xs"
            title="View Profile"
          >
            {displayInitials}
          </Link>
          <button
            onClick={handleLogoutClick}
            className="h-[30px] px-3.5 bg-transparent border border-border-primary hover:border-text-primary text-text-secondary hover:text-text-primary active:scale-[0.98] text-[9px] font-bold tracking-wider rounded-lg transition-all uppercase cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Catalog View Container */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto p-6 sm:p-8 flex flex-col gap-6">
        
        {/* Title area */}
        <div className="flex flex-col gap-1.5 animate-fadeIn">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-2.5 py-0.5 rounded-full inline-block self-start font-mono">
            Discover Center
          </span>
          <h1 className="font-display font-light text-3xl text-text-primary tracking-tight leading-tight">
            Explore Public eBooks
          </h1>
          <p className="text-xs text-text-secondary font-medium">
            Read complete manuscripts, rate chapters, and review authors' drafts.
          </p>
        </div>

        {/* Filter controls panel */}
        <section className="bg-bg-secondary border border-border-primary rounded-[20px] p-5 shadow-xs flex flex-col gap-4 animate-fadeIn transition-colors duration-250">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative flex items-center bg-bg-primary border border-border-primary rounded-xl overflow-hidden focus-within:border-accent-primary transition-colors">
              <span className="pl-3.5 text-text-muted select-none text-xs">🔍</span>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search eBook titles, topics, keywords..."
                className="w-full bg-transparent px-3 py-2.5 text-xs outline-none text-text-primary font-medium placeholder-text-muted"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="sm:w-[160px] flex items-center bg-bg-primary border border-border-primary rounded-xl px-3 overflow-hidden">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pr-1 whitespace-nowrap">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full bg-transparent py-2.5 text-xs outline-none text-text-primary font-semibold cursor-pointer border-0"
              >
                <option value="Newest" className="bg-bg-primary text-text-primary">Newest</option>
                <option value="Most Reads" className="bg-bg-primary text-text-primary">Most Reads</option>
                <option value="Highest Rated" className="bg-bg-primary text-text-primary">Highest Rated</option>
              </select>
            </div>

            <button
              type="submit"
              className="h-10 px-6 bg-accent-primary hover:bg-accent-hover active:scale-[0.98] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none"
            >
              Search
            </button>
          </form>

          <div className="w-full h-px bg-border-primary"></div>

          {/* Genre Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-accent-primary border-accent-hover text-white shadow-xs shadow-accent-primary/10"
                    : "bg-bg-tertiary border-border-primary text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Catalog eBook Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-border-primary border-t-accent-primary rounded-full animate-spin"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-bg-secondary border border-border-primary rounded-[24px] p-12 text-center shadow-xs flex flex-col items-center transition-colors duration-250">
            <span className="text-3xl mb-3">📚</span>
            <h3 className="font-display font-light text-xl text-text-primary mb-1">
              No published eBooks found
            </h3>
            <p className="text-xs text-text-secondary font-medium max-w-[280px] leading-relaxed">
              No eBooks matching category "{selectedCategory}" are currently published in the catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
            {books.map((book) => {
              const coverConf = getCoverConfig(book);
              const avgRate = getAvgRating(book);
              const categoryName = extractCategory(book.description);

              return (
                <div
                  key={book._id}
                  className="bg-bg-secondary border border-border-primary rounded-[24px] p-4 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 group text-text-primary"
                >
                  {/* Visual Cover card link */}
                  <Link to={`/view-book/${book._id}`} className="block mb-4">
                    <DiscoverBookCover
                      config={coverConf}
                      title={book.title}
                      author={book.author?.username || "Writer"}
                    />
                  </Link>

                  {/* Metadata */}
                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div>
                      {/* Genre Pill */}
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
                        {categoryName}
                      </span>
                      
                      {/* Title */}
                      <Link
                        to={`/view-book/${book._id}`}
                        className="font-display font-medium text-sm text-text-primary leading-tight block line-clamp-2 hover:text-accent-primary transition-colors"
                        title={book.title}
                      >
                        {book.title}
                      </Link>

                      {/* Author */}
                      <span className="text-[9px] text-text-muted font-semibold uppercase tracking-wider block mt-0.5">
                        By {book.author?.username || "Author"}
                      </span>
                    </div>

                    {/* Stats & Actions */}
                    <div className="border-t border-border-primary pt-3 flex flex-col gap-3">
                      {/* Reads & Stars */}
                      <div className="flex items-center justify-between text-[9px] font-bold text-text-muted uppercase tracking-widest">
                        <span className="flex items-center gap-0.5">👁 {book.reads || 0} Reads</span>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500 text-xs">★</span>
                          <span className="text-text-primary">
                            {avgRate > 0 ? `${avgRate} (${book.reviews.length})` : "0.0"}
                          </span>
                        </div>
                      </div>

                      {/* Action trigger */}
                      <Link
                        to={`/view-book/${book._id}`}
                        className="w-full h-9 bg-bg-tertiary hover:bg-bg-primary border border-border-primary text-text-secondary hover:text-text-primary active:scale-[0.98] rounded-xl text-[9px] font-bold tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer group-hover:bg-accent-primary group-hover:border-accent-hover group-hover:text-white"
                      >
                        Read eBook
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Reusable scrollbar styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.25);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.45);
        }
      `}</style>

    </div>
  );
};

export default DiscoverPage;
