import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import TextAreaField from "../components/ui/TextAreaField";
import SelectField from "../components/ui/SelectField";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api/books";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Create Form State
  const [formValues, setFormValues] = useState({
    title: "",
    category: "Technology & Coding",
    writingStyle: "Conversational",
    prompt: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Categories list
  const categories = [
    "Technology & Coding",
    "Business & Startups",
    "Fiction & Storytelling",
    "Self-Help & Growth",
    "Lifestyle & Health",
    "History & Science",
  ];

  // Writing styles list
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

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

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

  // Input change for creation form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate creation form
  const validateForm = () => {
    const errors = {};
    if (!formValues.title.trim()) {
      errors.title = "Book title is required";
    }
    if (!formValues.prompt.trim()) {
      errors.prompt = "Please describe the initial idea or outline";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle eBook Creation
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    const toastId = toast.loading("Initializing eBook draft...");
    const token = localStorage.getItem("token");

    // Serialize details inside the description field
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
      // Reset form
      setFormValues({
        title: "",
        category: "Technology & Coding",
        writingStyle: "Conversational",
        prompt: "",
      });
    } catch (err) {
      toast.error(err.message || "Could not create eBook. Try again.", {
        id: toastId,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Delete confirmation dialog
  const openDeleteDialog = (book, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedBook(book);
    setIsDeleteOpen(true);
  };

  // Confirm eBook Deletion
  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;

    setActionLoading(true);
    const toastId = toast.loading("Deleting eBook...");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/${selectedBook._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete eBook");
      }

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

  // Helper to extract category, style and prompt from description string
  const parseDescription = (desc) => {
    if (!desc) {
      return {
        category: "General",
        style: "Conversational",
        prompt: "",
      };
    }

    const categoryMatch = desc.match(/Category:\s*(.+)/i);
    const styleMatch = desc.match(/Style:\s*(.+)/i);
    const promptMatch = desc.match(/Prompt:\s*([\s\S]+)/i);

    let prompt = promptMatch ? promptMatch[1].trim() : desc;

    if (!promptMatch) {
      prompt = prompt
        .replace(/Category:\s*.+/gi, "")
        .replace(/Style:\s*.+/gi, "")
        .trim();
    }

    return {
      category: categoryMatch ? categoryMatch[1].split("\n")[0].trim() : "General",
      style: styleMatch ? styleMatch[1].split("\n")[0].trim() : "Conversational",
      prompt: prompt || desc,
    };
  };

  // Helper to format relative time dynamically
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) {
      return "Updated just now";
    }
    if (diffInMins < 60) {
      return `Updated ${diffInMins} ${diffInMins === 1 ? "minute" : "minutes"} ago`;
    }
    if (diffInHours < 24) {
      return `Updated ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffInDays < 7) {
      return `Updated ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    }

    return `Updated on ${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  // Statistics calculations
  const totalBooks = books.length;
  const totalChapters = books.reduce((acc, curr) => acc + (curr.chapters?.length || 0), 0);
  const publishedBooks = books.filter((b) => b.isPublished).length;

  // Filtered books catalog
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!categoryFilter) return matchesSearch;

    const { category } = parseDescription(book.description);
    return matchesSearch && category === categoryFilter;
  });

  // Separate drafts and published books for section splits
  const draftBooks = filteredBooks.filter((b) => !b.isPublished);
  const publishedBooksList = filteredBooks.filter((b) => b.isPublished);

  // Render cover component
  const BookCover = ({ title, category, style }) => (
    <div className="h-44 bg-[#F5F5F4] border-b border-slate-100 flex flex-col justify-between p-5 relative overflow-hidden select-none">
      {/* Decorative publishing grid frame */}
      <div className="absolute inset-4 border border-slate-300/30 rounded-lg pointer-events-none"></div>
      
      <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400/80 z-10 text-left">
        {style}
      </span>

      <h4 className="font-display font-light text-slate-800 text-base leading-tight text-center max-w-[80%] mx-auto z-10 line-clamp-3">
        {title}
      </h4>

      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 z-10 text-center">
        {category}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans">
      {/* Navbar Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18.477s-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">
              eBook<span className="text-slate-500">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline mr-1">
              Hello, <strong className="text-slate-800">{user?.username || "Sandeep"}</strong>
            </span>
            <Link
              to="/profile"
              className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-850 transition-colors border border-indigo-100 hover:border-indigo-600 px-3 py-1.5 rounded-lg cursor-pointer bg-indigo-50/30"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 transition-colors border border-slate-200 hover:border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8 text-left animate-fadeIn">
          <h1 className="font-display font-light text-3xl sm:text-4xl text-slate-900 tracking-tight mb-1.5">
            Hello, <span className="font-normal">{user?.username || "Sandeep"}</span> 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mb-3 leading-relaxed">
            Continue building amazing eBooks with AI.
          </p>
          <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 bg-slate-50 border border-slate-100 rounded-lg py-1 px-3 inline-block shadow-xs">
            You have: <strong className="text-slate-700">{totalBooks} {totalBooks === 1 ? "Book" : "Books"}</strong>
            <span className="mx-2 text-slate-200">|</span>
            <strong className="text-slate-700">{publishedBooks} Published</strong>
          </div>
        </div>

        {/* High-Impact Statistics Grid */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {/* Total Books */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-xs flex flex-col justify-between min-h-[110px] text-left">
            <div>
              <svg className="w-4.5 h-4.5 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18.477s-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                Total Books
              </span>
            </div>
            <span className="font-display text-4xl sm:text-5xl font-light text-slate-800 leading-none">
              {String(totalBooks).padStart(2, "0")}
            </span>
          </div>

          {/* AI Chapters */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-xs flex flex-col justify-between min-h-[110px] text-left">
            <div>
              <svg className="w-4.5 h-4.5 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002 2m-3 7h3m-3 4h3m-6-4h.01M9 16.01H9" />
              </svg>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                AI Chapters
              </span>
            </div>
            <span className="font-display text-4xl sm:text-5xl font-light text-slate-800 leading-none">
              {String(totalChapters).padStart(2, "0")}
            </span>
          </div>

          {/* Published */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-xs flex flex-col justify-between min-h-[110px] text-left">
            <div>
              <svg className="w-4.5 h-4.5 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                Published
              </span>
            </div>
            <span className="font-display text-4xl sm:text-5xl font-light text-slate-800 leading-none">
              {String(publishedBooks).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Wider Search & Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input (450px wide on desktop) */}
            <div className="w-full sm:w-[450px] relative">
              <input
                type="text"
                placeholder="Search eBooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] pl-10 pr-4 bg-[#FAFAF9] border border-slate-200 focus:border-slate-800 rounded-xl text-xs font-sans placeholder-slate-400 outline-none transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Dropdown Filter (200px wide on desktop) */}
            <div className="w-full sm:w-[200px] relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-[42px] pl-4 pr-10 bg-[#FAFAF9] border border-slate-200 focus:border-slate-800 rounded-xl text-xs font-sans text-slate-700 outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="primary"
            className="w-full lg:w-auto h-[42px] bg-emerald-700 hover:bg-emerald-600 border-none text-[10px] font-bold tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm px-6 py-0 uppercase"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Your Next eBook
          </Button>
        </div>

        {/* Library Content */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] rounded-[20px] h-[340px] animate-pulse flex flex-col">
                <div className="h-44 bg-slate-50 rounded-t-[20px]"></div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-full"></div>
                  <div className="h-3 bg-[#FAFAF9] rounded w-full mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          /* Main Empty State */
          <div className="w-full bg-white border border-[#E5E7EB] rounded-[24px] p-10 sm:p-16 text-center shadow-xs flex flex-col items-center max-w-xl mx-auto mt-6 animate-fadeIn">
            <div className="h-16 w-16 bg-slate-50 border border-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18.477s-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-display font-light text-2xl text-slate-900 mb-2">
              Start Your First Publication
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-8 max-w-sm leading-relaxed">
              Unlock the power of AI to outline and draft complete eBooks from a single prompt idea.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="primary"
              className="h-[46px] bg-emerald-700 hover:bg-emerald-600 border-none text-[10px] font-bold tracking-wider rounded-xl transition-all duration-300 px-8 uppercase"
            >
              Get Started
            </Button>
          </div>
        ) : (
          /* Grid list separated by states */
          <div className="flex flex-col gap-12 text-left">
            {/* Section 1: Continue Writing (Drafts) */}
            {draftBooks.length > 0 && (
              <div className="animate-fadeIn">
                <h3 className="font-display font-light text-xl sm:text-2xl text-slate-900 tracking-tight mb-6 flex items-center gap-2.5">
                  Continue Writing
                  <span className="h-5 px-2 bg-slate-100 text-slate-500 rounded-md text-[9px] font-extrabold uppercase tracking-widest flex items-center justify-center border border-slate-200/40">
                    Drafts ({draftBooks.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftBooks.map((book) => {
                    const { category, style, prompt } = parseDescription(book.description);
                    return (
                      <div
                        key={book._id}
                        className="bg-white border border-[#E5E7EB] rounded-[20px] shadow-xs hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out overflow-hidden flex flex-col min-h-[380px] group"
                      >
                        <BookCover title={book.title} category={category} style={style} />
                        
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Meta stats bar */}
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-3 text-slate-400 text-[10px] font-medium">
                              <span className="font-bold text-slate-600 uppercase tracking-wider">
                                {book.chapters?.length || 0} {book.chapters?.length === 1 ? "Chapter" : "Chapters"}
                              </span>
                              <span className="text-slate-200">•</span>
                              <span>
                                {book.chapters?.length > 0 ? (book.chapters.length * 1250).toLocaleString() + " Words" : "0 Words"}
                              </span>
                              <span className="text-slate-200">•</span>
                              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase bg-slate-50 border border-slate-200/40 text-slate-400">
                                Draft
                              </span>
                            </div>
                            
                            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium mb-2">
                              {prompt || "No prompt specified."}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                            <Link to={`/editor?bookId=${book._id}`} className="flex-1">
                              <Button
                                variant="secondary"
                                className="w-full h-[36px] text-[9px] font-bold tracking-wider rounded-lg border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center uppercase"
                              >
                                Continue Writing
                              </Button>
                            </Link>

                            <Link to={`/view-book/${book._id}`}>
                              <Button
                                variant="secondary"
                                className="h-[36px] px-4 text-[9px] font-bold tracking-wider rounded-lg border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center uppercase"
                              >
                                Preview
                              </Button>
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => openDeleteDialog(book, e)}
                              title="Delete eBook"
                              className="h-[36px] w-[36px] border border-slate-200 hover:border-red-500 text-slate-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2: Recent Activity / Published Books */}
            {publishedBooksList.length > 0 && (
              <div className="animate-fadeIn">
                <h3 className="font-display font-light text-xl sm:text-2xl text-slate-900 tracking-tight mb-6 flex items-center gap-2.5">
                  Published Books
                  <span className="h-5 px-2 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-extrabold uppercase tracking-widest flex items-center justify-center border border-emerald-100/40">
                    Published ({publishedBooksList.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedBooksList.map((book) => {
                    const { category, style, prompt } = parseDescription(book.description);
                    return (
                      <div
                        key={book._id}
                        className="bg-white border border-[#E5E7EB] rounded-[20px] shadow-xs hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out overflow-hidden flex flex-col min-h-[380px] group"
                      >
                        <BookCover title={book.title} category={category} style={style} />
                        
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Meta stats bar */}
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-3 text-slate-400 text-[10px] font-medium">
                              <span className="font-bold text-slate-600 uppercase tracking-wider">
                                {book.chapters?.length || 0} {book.chapters?.length === 1 ? "Chapter" : "Chapters"}
                              </span>
                              <span className="text-slate-200">•</span>
                              <span>
                                {book.chapters?.length > 0 ? (book.chapters.length * 1250).toLocaleString() + " Words" : "0 Words"}
                              </span>
                              <span className="text-slate-200">•</span>
                              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase bg-emerald-50 border border-emerald-150 text-emerald-600">
                                Published
                              </span>
                            </div>
                            
                            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium mb-2">
                              {prompt || "No prompt specified."}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                            <Link to={`/editor?bookId=${book._id}`} className="flex-1">
                              <Button
                                variant="secondary"
                                className="w-full h-[36px] text-[9px] font-bold tracking-wider rounded-lg border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center uppercase"
                              >
                                Edit Book
                              </Button>
                            </Link>

                            <Link to={`/view-book/${book._id}`}>
                              <Button
                                variant="secondary"
                                className="h-[36px] px-4 text-[9px] font-bold tracking-wider rounded-lg border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center uppercase"
                              >
                                Preview
                              </Button>
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => openDeleteDialog(book, e)}
                              title="Delete eBook"
                              className="h-[36px] w-[36px] border border-slate-200 hover:border-red-500 text-slate-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* If filters yielded no matches within existing categories */}
            {draftBooks.length === 0 && publishedBooksList.length === 0 && (
              <div className="text-center py-10 w-full text-slate-400 text-xs sm:text-sm font-medium">
                No eBooks found matching your search query or filters.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Creation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New eBook"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5">
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
            label="Initial Outline / Single Idea Prompt"
            name="prompt"
            placeholder="Describe what your eBook is about or outline the chapters you want to generate..."
            value={formValues.prompt}
            onChange={handleInputChange}
            error={formErrors.prompt}
            disabled={actionLoading}
            required
          />

          <Button
            disabled={actionLoading}
            type="submit"
            variant="primary"
            className="w-full h-[50px] bg-emerald-700 hover:bg-emerald-600 border-none text-[10px] font-bold tracking-wider rounded-xl transition-all duration-300 mt-2 flex items-center justify-center"
          >
            {actionLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Initialize eBook Draft"
            )}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedBook(null);
        }}
        title="Delete eBook"
      >
        <div className="flex flex-col gap-4 text-left">
          <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-800">"{selectedBook?.title}"</strong>? This action is permanent and will delete all chapters and drafts.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedBook(null);
              }}
              disabled={actionLoading}
              className="flex-1 h-[46px] border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-900 text-[10px] font-bold tracking-wider rounded-xl transition-all uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="flex-1 h-[46px] bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold tracking-wider rounded-xl transition-all uppercase cursor-pointer"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                "Delete eBook"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
