import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const API_BOOKS = "http://localhost:5000/api/books";

// Book Cover Component
const BookCover = ({ config, title, author, className = "" }) => {
  const isGradientClass = config?.gradient && (config.gradient.startsWith("bg-") || config.gradient.includes("from-"));

  return (
    <div
      className={`relative rounded-r-md shadow-2xl overflow-hidden border-l-[4px] border-black/35 flex flex-col justify-between p-4 aspect-[3/4.2] text-white ${className}`}
      style={{
        backgroundImage: config?.imageUrl ? `url(${config.imageUrl})` : undefined,
        backgroundSize: config?.imageUrl ? "cover" : undefined,
        backgroundPosition: config?.imageUrl ? "center" : undefined,
        background: config?.imageUrl ? undefined : (isGradientClass ? undefined : (config?.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)")),
      }}
    >
      {/* Crease spine shadow */}
      <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-r from-black/30 via-white/5 to-transparent z-10"></div>
      
      {/* Dark overlay for readability */}
      {config?.imageUrl && (
        <div className="absolute inset-0 bg-black/45 z-0"></div>
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {config?.style === "minimalist" ? (
          <div className="h-full flex flex-col justify-between text-left">
            <div className="text-[8px] tracking-widest uppercase opacity-60 font-mono">
              {config?.subtitle || "EBOOK SPECIFICATION"}
            </div>
            <h4 className="font-sans font-extrabold text-sm sm:text-base leading-tight tracking-tight mt-2 text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[8px] font-medium opacity-80 mt-auto font-mono truncate">
              BY {author?.toUpperCase() || "AUTHOR"}
            </div>
          </div>
        ) : config?.style === "editorial" ? (
          <div className="h-full flex flex-col items-center justify-between text-center border border-white/20 p-2 rounded-xs">
            <div className="text-[7px] tracking-widest uppercase opacity-60 font-mono">
              {config?.subtitle || "FIRST EDITION"}
            </div>
            <h4 className="font-display font-light text-sm sm:text-base italic leading-tight my-auto text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[8px] tracking-wider uppercase opacity-75 truncate w-full">
              {author || "AUTHOR"}
            </div>
          </div>
        ) : config?.style === "geometric" ? (
          <div className="h-full flex flex-col justify-between relative">
            <div className="absolute -top-6 -right-6 w-14 h-14 rounded-full bg-white/10 blur-xs"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-black/20 blur-sm"></div>
            
            <div className="z-10">
              <h4 className="font-sans font-black text-sm uppercase leading-none tracking-tighter text-white line-clamp-3">
                {title}
              </h4>
              <div className="w-5 h-0.5 bg-white/60 mt-1"></div>
            </div>
            <div className="z-10 text-right mt-auto">
              <span className="text-[8px] font-bold tracking-widest uppercase opacity-90 block truncate">
                {author || "AUTHOR"}
              </span>
              <span className="text-[5px] opacity-50 block font-mono">
                {config?.subtitle || "DIGITAL PUBLICATION"}
              </span>
            </div>
          </div>
        ) : (
          /* default: modern */
          <div className="h-full flex flex-col justify-between text-center">
            <div>
              <div className="text-[7px] tracking-widest uppercase opacity-75 bg-black/10 inline-block px-1.5 py-0.5 rounded-full font-mono">
                {config?.subtitle || "EBOOK"}
              </div>
            </div>
            <h4 className="font-display font-medium text-sm sm:text-base leading-tight tracking-normal my-auto text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[8px] tracking-wider font-semibold opacity-90 border-t border-white/20 pt-1.5 truncate w-full">
              {author || "AUTHOR"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewBookPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reader states
  const [activeChapterIndex, setActiveChapterIndex] = useState(-1); // -1 is Book Cover Page
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16); // px font size
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [coverConfig, setCoverConfig] = useState(null);

  // Reviews states
  const [reviewsSidebarOpen, setReviewsSidebarOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Fetch book details
  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Could not find book");

      const data = await response.json();
      setBook(data);

      // Parse cover configurations
      let parsedConfig = {
        gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
        style: "modern",
        subtitle: "FIRST EDITION",
        title: data.title,
        imageUrl: "",
      };

      try {
        if (data.coverImage) {
          const parsed = JSON.parse(data.coverImage);
          if (parsed.gradient || parsed.imageUrl) {
            parsedConfig = { ...parsedConfig, ...parsed };
          }
        }
      } catch (e) {
        if (data.coverImage && (data.coverImage.startsWith("linear-gradient") || data.coverImage.startsWith("from-"))) {
          parsedConfig.gradient = data.coverImage;
        }
      }
      setCoverConfig(parsedConfig);
      recordRead();
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch book details.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const recordRead = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BOOKS}/${bookId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error("Error logging read session:", e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Please enter your comment for the review");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BOOKS}/${bookId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (response.ok) {
        const data = await response.json();
        setBook({ ...book, reviews: data.reviews });
        setReviewComment("");
        setReviewRating(5);
        toast.success("Thank you for your rating & review!");
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not submit review.");
    }
  };

  const activeChapter = book?.chapters?.[activeChapterIndex];
  const chapterPages = activeChapter?.body ? activeChapter.body.split("<!-- pagebreak -->") : [""];
  const totalChapters = book?.chapters?.length || 0;

  // Handle page flips
  const handleNext = () => {
    if (activeChapterIndex === -1) {
      // Cover page to first chapter
      if (totalChapters > 0) {
        setActiveChapterIndex(0);
        setCurrentPageIndex(0);
      } else {
        toast.error("This eBook has no chapters yet.");
      }
      return;
    }

    if (currentPageIndex < chapterPages.length - 1) {
      // Next page inside same chapter
      setCurrentPageIndex(currentPageIndex + 1);
    } else if (activeChapterIndex < totalChapters - 1) {
      // Next chapter
      setActiveChapterIndex(activeChapterIndex + 1);
      setCurrentPageIndex(0);
    } else {
      // Last chapter finished
      setActiveChapterIndex(totalChapters); // triggers "Book Completed" screen
    }
  };

  const handlePrev = () => {
    if (activeChapterIndex === totalChapters) {
      // Back from completed screen
      setActiveChapterIndex(totalChapters - 1);
      const prevCh = book.chapters[totalChapters - 1];
      const prevPages = prevCh?.body ? prevCh.body.split("<!-- pagebreak -->") : [""];
      setCurrentPageIndex(prevPages.length - 1);
      return;
    }

    if (activeChapterIndex === -1) return; // cannot go back from cover

    if (currentPageIndex > 0) {
      // Previous page in same chapter
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (activeChapterIndex > 0) {
      // Previous chapter's last page
      const prevChIdx = activeChapterIndex - 1;
      setActiveChapterIndex(prevChIdx);
      const prevCh = book.chapters[prevChIdx];
      const prevPages = prevCh?.body ? prevCh.body.split("<!-- pagebreak -->") : [""];
      setCurrentPageIndex(prevPages.length - 1);
    } else {
      // Back to cover page
      setActiveChapterIndex(-1);
    }
  };

  const selectChapterIndex = (idx) => {
    setActiveChapterIndex(idx);
    setCurrentPageIndex(0);
  };

  // Progress percentage calculation
  const getProgressPercent = () => {
    if (activeChapterIndex === -1) return 0;
    if (activeChapterIndex >= totalChapters) return 100;
    
    const chapterStep = 100 / totalChapters;
    const pageRatio = currentPageIndex / chapterPages.length;
    return Math.min(100, Math.round((activeChapterIndex + pageRatio) * chapterStep));
  };

  // CSS theme settings
  const themeClasses = {
    light: "bg-bg-primary text-text-primary border-border-primary",
    cream: "bg-bg-primary text-text-primary border-border-primary",
    dark: "bg-bg-primary text-text-primary border-border-primary",
  };

  const innerEditorClasses = {
    light: "prose-slate",
    cream: "prose-amber",
    dark: "prose-invert",
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans transition-colors duration-300 ${themeClasses[theme]}`}>
      
      {/* Header controls bar */}
      <header className={`h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white/5 backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-xs font-bold uppercase tracking-wider hover:opacity-85 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <span className="opacity-30">|</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Toggle outline sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <span className="text-xs font-semibold truncate max-w-[240px] block opacity-85">
          {book?.title || "eBook Reader"}
        </span>

        {/* Theme and resizing controls */}
        <div className="flex items-center gap-4">
          
          {/* Reviews Toggle */}
          <button
            onClick={() => setReviewsSidebarOpen(!reviewsSidebarOpen)}
            className={`px-3 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider ${
              reviewsSidebarOpen
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-black shadow-xs shadow-indigo-100"
                : "bg-transparent opacity-75"
            }`}
            title="Toggle Reader Reviews"
          >
            💬 Reviews ({book?.reviews?.length || 0})
          </button>

          {/* FontSize controls */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[10px] font-bold px-1.5 opacity-60">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Theme pickers */}
          <div className="flex items-center gap-1.5">
            {[
              { name: "light", label: "Light", color: "bg-[#FFFFFF] border-slate-200", ringColor: "ring-[#2f80ed]" },
              { name: "cream", label: "Cream", color: "bg-[#faf6ee] border-[#ebd9c4]", ringColor: "ring-[#a16207]" },
              { name: "dark", label: "Dark", color: "bg-[#121212] border-zinc-800", ringColor: "ring-[#8b5cf6]" },
            ].map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${t.color} ${
                  theme === t.name ? `ring-2 ring-offset-1 ${t.ringColor} scale-105` : "hover:scale-105"
                }`}
                title={`${t.label} Theme`}
              />
            ))}
          </div>

        </div>
      </header>

      {/* Reader Layout body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-350 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 flex relative overflow-hidden">
          
          {/* Collapse sidebar TOC */}
          <aside
            className={`border-r shrink-0 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
              sidebarOpen ? "w-[240px] opacity-100" : "w-0 opacity-0"
            } bg-black/2 dark:bg-white/2 border-slate-100/50`}
          >
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 custom-scrollbar">
              <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-40 pl-2 mb-2 block">
                Book Chapters
              </span>

              {/* Cover page link */}
              <button
                onClick={() => setActiveChapterIndex(-1)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-xs cursor-pointer font-semibold transition-all ${
                  activeChapterIndex === -1
                    ? "bg-indigo-650 border-indigo-750 text-white shadow-md shadow-indigo-600/10"
                    : "bg-transparent border-transparent opacity-60 hover:bg-black/5 dark:hover:bg-white/5 hover:opacity-90"
                }`}
              >
                📖 Cover Page
              </button>

              <div className="w-full h-px bg-slate-200/50 dark:bg-zinc-800/50 my-2"></div>

              {/* Chapter routes list */}
              {book?.chapters?.map((ch, idx) => (
                <button
                  key={ch._id || idx}
                  onClick={() => selectChapterIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs cursor-pointer flex flex-col gap-0.5 transition-all ${
                    idx === activeChapterIndex
                      ? "bg-slate-900 border-slate-950 text-white shadow-md dark:bg-zinc-100 dark:border-zinc-200 dark:text-slate-900"
                      : "bg-transparent border-transparent opacity-65 hover:bg-black/5 dark:hover:bg-white/5 hover:opacity-90"
                  }`}
                >
                  <span className="font-semibold block truncate">
                    {ch.title}
                  </span>
                </button>
              ))}
            </div>

            {/* User credentials summary */}
            <div className="p-4 border-t border-slate-200/30 text-[9px] font-bold uppercase tracking-wider opacity-40">
              Reader: {user?.username}
            </div>
          </aside>

          {/* Central reader canvas wrapper */}
          <main className="flex-1 overflow-y-auto flex flex-col justify-between custom-scrollbar px-6 py-8 relative">
            
            {activeChapterIndex === -1 ? (
              /* EBOOK COVER WELCOME STAGE */
              <div className="m-auto w-full max-w-[480px] flex flex-col items-center text-center py-6 animate-fadeIn">
                <BookCover
                  config={coverConfig}
                  title={book?.title || ""}
                  author={user?.username || "Writer"}
                  className="w-[180px] sm:w-[200px] mb-8"
                />
                
                <h2 className="font-display font-light text-2xl sm:text-3xl tracking-tight mb-2">
                  {book?.title}
                </h2>
                
                {book?.description && (
                  <p className="text-xs sm:text-sm font-medium opacity-60 mb-8 max-w-[340px] leading-relaxed">
                    {book.description.replace(/Category:\s*.+/gi, "").replace(/Style:\s*.+/gi, "").replace(/Prompt:\s*.+/gi, "").trim()}
                  </p>
                )}

                <button
                  onClick={handleNext}
                  className="h-11 px-8 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-650/10 cursor-pointer flex items-center gap-2"
                >
                  Start Reading
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : activeChapterIndex === totalChapters ? (
              /* BOOK COMPLETED CONGRATULATIONS SCREEN */
              <div className="m-auto w-full max-w-[420px] text-center p-8 bg-black/2 dark:bg-white/2 border border-slate-200/20 rounded-[28px] shadow-2xl flex flex-col items-center animate-scaleUp">
                <div className="h-14 w-14 bg-emerald-50 border border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/40 rounded-full flex items-center justify-center mb-5 text-2xl">
                  🎉
                </div>
                <h3 className="font-display font-light text-2xl mb-2">
                  Congratulations!
                </h3>
                <p className="text-xs font-semibold opacity-60 mb-8 max-w-[300px] leading-relaxed">
                  You have successfully completed reading "{book?.title}".
                </p>
                <div className="flex flex-col gap-2.5 w-full">
                  <button
                    onClick={handlePrev}
                    className="w-full h-10 border border-slate-300 dark:border-zinc-700 hover:border-slate-800 dark:hover:border-zinc-200 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back to Chapters
                  </button>
                  <Link
                    to="/dashboard"
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    Return to Library
                  </Link>
                </div>
              </div>
            ) : (
              /* INDIVIDUAL PAGES DISPLAY WRITER BLOCK */
              <div className="w-full max-w-[680px] mx-auto flex flex-col flex-1 justify-between animate-fadeIn">
                
                {/* Book header indicators */}
                <div className="flex items-center justify-between border-b border-slate-200/10 pb-4 mb-8 text-[9px] font-bold uppercase tracking-widest opacity-40">
                  <span>{activeChapter?.title}</span>
                  <span>Page {currentPageIndex + 1} of {chapterPages.length}</span>
                </div>

                {/* Main page prose renderer */}
                <div
                  className={`flex-1 font-serif leading-relaxed text-justify whitespace-pre-line break-words select-text ${innerEditorClasses[theme]}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: "1.75",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: chapterPages[currentPageIndex] || "<p className='italic opacity-55 text-center'>This page is empty...</p>"
                  }}
                />

                {/* Individual navigation flips */}
                <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-200/10 shrink-0">
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2 border border-slate-250 dark:border-zinc-700 hover:border-slate-800 dark:hover:border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ← Back
                  </button>

                  <div className="flex items-center gap-1.5">
                    {chapterPages.map((_, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setCurrentPageIndex(pIdx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                          pIdx === currentPageIndex ? "bg-slate-700 dark:bg-zinc-100 scale-125" : "bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400"
                        }`}
                        title={`Go to page ${pIdx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-slate-900 text-white dark:bg-zinc-100 dark:text-slate-900 hover:bg-slate-850 dark:hover:bg-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {currentPageIndex === chapterPages.length - 1 && activeChapterIndex === totalChapters - 1
                      ? "Finish"
                      : "Continue →"}
                  </button>
                </div>

              </div>
            )}

            {/* Bottom reading progress meter bar */}
            {activeChapterIndex !== -1 && (
              <div className="w-full mt-8 pt-4 shrink-0 flex items-center gap-3">
                <div className="flex-1 h-1 bg-slate-200/40 dark:bg-zinc-800/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercent()}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-40 shrink-0 select-none">
                  {getProgressPercent()}% Read
                </span>
              </div>
            )}

          </main>

          {/* Collapsible right sidebar for Reviews */}
          <aside
            className={`border-l shrink-0 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
              reviewsSidebarOpen ? "w-[300px] opacity-100" : "w-0 opacity-0"
            } bg-white dark:bg-zinc-900 border-slate-100/50 p-4`}
          >
            <div className="flex flex-col h-full justify-between min-h-0 overflow-hidden text-slate-800 dark:text-zinc-200">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450">
                  Reader Reviews
                </span>
                <button
                  onClick={() => setReviewsSidebarOpen(false)}
                  className="text-slate-450 hover:text-slate-800 dark:hover:text-zinc-100 text-[10px] font-bold uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Reviews List and Form */}
              <div className="flex-grow overflow-y-auto custom-scrollbar py-4 flex flex-col gap-3 font-sans pr-1">
                
                {/* Form to submit review */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200/40 flex flex-col gap-2 shrink-0"
                >
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Rate this Book
                  </span>
                  
                  {/* Gold star rating list */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-lg cursor-pointer focus:outline-none transition-transform active:scale-110"
                      >
                        {star <= reviewRating ? (
                          <span className="text-amber-500">★</span>
                        ) : (
                          <span className="text-slate-300 dark:text-zinc-700">★</span>
                        )}
                      </button>
                    ))}
                    <span className="text-[10px] font-bold text-slate-500 font-mono ml-1">
                      {reviewRating} Stars
                    </span>
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review comments..."
                    rows="3"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 text-[10px] outline-none text-slate-700 dark:text-zinc-300 resize-none font-medium leading-normal"
                  />

                  <button
                    type="submit"
                    className="w-full h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs shadow-blue-550/10"
                  >
                    Submit Review
                  </button>
                </form>

                <div className="w-full h-px bg-slate-100 dark:bg-zinc-850 my-1"></div>

                {/* Display reviews list */}
                {!book?.reviews || book.reviews.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-[10px] font-semibold">
                    No reviews yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  book.reviews.map((r, rIdx) => (
                    <div
                      key={r._id || rIdx}
                      className="bg-slate-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-slate-100 dark:border-zinc-850 flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="font-extrabold text-slate-700 dark:text-zinc-300 truncate max-w-[120px]">
                          {r.username}
                        </span>
                        <span className="text-amber-500 font-bold">
                          {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-relaxed break-words whitespace-pre-wrap">
                        {r.comment}
                      </p>
                      <span className="text-[8px] text-slate-400 font-mono self-end">
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

        </div>
      )}

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

export default ViewBookPage;
