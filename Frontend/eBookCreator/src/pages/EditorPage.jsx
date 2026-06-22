import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import toast from "react-hot-toast";
import ExportSettingsModal from "../components/ui/ExportSettingsModal";
import Modal from "../components/ui/Modal";

const API_BOOKS = "http://localhost:5000/api/books";
const API_AI = "http://localhost:5000/api/ai";

// Book Cover Component (Reusable)
const BookCover = ({ config, title, author, className = "" }) => {
  const isGradientClass = config?.gradient && (config.gradient.startsWith("bg-") || config.gradient.includes("from-"));

  return (
    <div
      className={`relative rounded-r-md shadow-lg overflow-hidden border-l-[3px] border-black/30 flex flex-col justify-between p-3 aspect-[3/4.2] text-white ${className}`}
      style={{
        backgroundImage: config?.imageUrl ? `url(${config.imageUrl})` : undefined,
        backgroundSize: config?.imageUrl ? "cover" : undefined,
        backgroundPosition: config?.imageUrl ? "center" : undefined,
        background: config?.imageUrl ? undefined : (isGradientClass ? undefined : (config?.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)")),
      }}
    >
      {/* Crease spine shadow */}
      <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-r from-black/25 via-white/5 to-transparent z-10"></div>
      
      {/* Dark overlay for readability */}
      {config?.imageUrl && (
        <div className="absolute inset-0 bg-black/40 z-0"></div>
      )}

      {/* Content wrapper with z-10 to sit above overlay */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {config?.style === "minimalist" ? (
          <div className="h-full flex flex-col justify-between text-left">
            <div className="text-[7px] tracking-widest uppercase opacity-60 font-mono">
              {config?.subtitle || "EBOOK SPECIFICATION"}
            </div>
            <h4 className="font-sans font-extrabold text-xs sm:text-sm leading-tight tracking-tight mt-2 text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[7px] font-medium opacity-80 mt-auto font-mono truncate">
              BY {author?.toUpperCase() || "AUTHOR"}
            </div>
          </div>
        ) : config?.style === "editorial" ? (
          <div className="h-full flex flex-col items-center justify-between text-center border border-white/20 p-1.5 rounded-xs">
            <div className="text-[6px] tracking-widest uppercase opacity-60 font-mono">
              {config?.subtitle || "FIRST EDITION"}
            </div>
            <h4 className="font-display font-light text-sm sm:text-base italic leading-tight my-auto text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[7px] tracking-wider uppercase opacity-75 truncate w-full">
              {author || "AUTHOR"}
            </div>
          </div>
        ) : config?.style === "geometric" ? (
          <div className="h-full flex flex-col justify-between relative">
            <div className="absolute -top-6 -right-6 w-14 h-14 rounded-full bg-white/10 blur-xs"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-black/20 blur-sm"></div>
            
            <div className="z-10">
              <h4 className="font-sans font-black text-xs sm:text-sm uppercase leading-none tracking-tighter text-white line-clamp-3">
                {title}
              </h4>
              <div className="w-5 h-0.5 bg-white/60 mt-1"></div>
            </div>
            <div className="z-10 text-right mt-auto">
              <span className="text-[7px] font-bold tracking-widest uppercase opacity-90 block truncate">
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
              <div className="text-[6px] tracking-widest uppercase opacity-75 bg-black/10 inline-block px-1.5 py-0.5 rounded-full font-mono">
                {config?.subtitle || "EBOOK"}
              </div>
            </div>
            <h4 className="font-display font-medium text-xs sm:text-sm leading-tight tracking-normal my-auto text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[7px] tracking-wider font-semibold opacity-90 border-t border-white/20 pt-1 truncate w-full">
              {author || "AUTHOR"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get("bookId");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Core Book states
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(-1);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterBody, setChapterBody] = useState("");

  const [chapterPages, setChapterPages] = useState([""]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Editor states
  const editorRef = useRef(null);
  const isTypingRef = useRef(false);
  const [selectedText, setSelectedText] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sidebars states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Export dropdown state
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // AI loading and Staged checklist loader
  const [aiDrafting, setAiDrafting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState("outline"); // "outline" | "chapter"
  const [generationStep, setGenerationStep] = useState(0);

  // Outline generation parameters
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
  const [outlineParams, setOutlineParams] = useState({
    topic: "",
    audience: "General Audience",
    tone: "Professional",
    length: "5 Chapters",
  });

  // AI Cover Builder parameters
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [coverConfig, setCoverConfig] = useState({
    gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
    style: "modern",
    subtitle: "FIRST EDITION",
    title: "",
    imageUrl: "",
  });
  const [tempTitle, setTempTitle] = useState("");
  const [tempSubtitle, setTempSubtitle] = useState("");
  const [tempGradient, setTempGradient] = useState("linear-gradient(135deg, #1e3a8a, #3b82f6)");
  const [tempStyle, setTempStyle] = useState("modern");
  const [tempImageUrl, setTempImageUrl] = useState("");

  // AI Chat states
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState([
    { sender: "ai", text: "<p>Hello! I am your AI co-writer. Ask me to explain a section, summarize ideas, or generate writing examples based on your chapter contents.</p>" }
  ]);
  const [isAiChatLoading, setIsAiChatLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Scroll chat to bottom on history change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiChatHistory, isAiChatLoading]);

  const outlineSteps = [
    "🔍 Researching niche & target audience...",
    "🏗️ Structuring outline chapters...",
    "🧠 Refining summaries and objectives...",
    "✨ Finalizing table of contents..."
  ];

  const chapterSteps = [
    "🔍 Analyzing chapter context...",
    "🏗️ Creating section headings...",
    "✍️ Drafting rich paragraphs...",
    "✨ Formatting and polishing HTML..."
  ];

  // Fetch book details on mount
  useEffect(() => {
    if (!bookId) {
      toast.error("No eBook selected.");
      navigate("/dashboard");
      return;
    }
    fetchBookDetails();
  }, [bookId]);

  // Sync window selection text
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      // Check if selection is within the editor element
      if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
        setSelectedText(selection.toString().trim());
      }
    } else {
      setSelectedText("");
    }
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Timer: ticking staged loader steps
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Timer: debounced auto-save
  useEffect(() => {
    if (!isDirty || activeChapterIndex === -1 || !book) return;

    const timer = setTimeout(() => {
      saveChapterContentSilent(activeChapterIndex, chapterTitle, chapterBody);
    }, 2000);

    return () => clearTimeout(timer);
  }, [chapterBody, chapterTitle, isDirty]);

  // Update cover config states when book changes
  useEffect(() => {
    if (book) {
      let parsedConfig = {
        gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
        style: "modern",
        subtitle: "FIRST EDITION",
        title: book.title,
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

      setCoverConfig(parsedConfig);
      setTempTitle(parsedConfig.title || book.title);
      setTempSubtitle(parsedConfig.subtitle || "FIRST EDITION");
      setTempGradient(parsedConfig.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)");
      setTempStyle(parsedConfig.style || "modern");
      setTempImageUrl(parsedConfig.imageUrl || "");
    }
  }, [book]);

  const fetchBookDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load eBook");

      const data = await response.json();
      setBook(data);

      if (data.chapters && data.chapters.length > 0) {
        setActiveChapterIndex(0);
        setChapterTitle(data.chapters[0].title);
        const fullBody = data.chapters[0].body || "";
        setChapterBody(fullBody);
        
        const parsed = fullBody.split("<!-- pagebreak -->");
        setChapterPages(parsed);
        setCurrentPageIndex(0);

        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = parsed[0] || "";
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch eBook details.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const selectChapter = async (index) => {
    if (index === activeChapterIndex) return;

    // Save previous active chapter immediately if dirty
    if (isDirty && activeChapterIndex !== -1 && book) {
      await saveChapterContentSilent(activeChapterIndex, chapterTitle, chapterBody);
    }

    setActiveChapterIndex(index);
    setChapterTitle(book.chapters[index].title);
    const bodyVal = book.chapters[index].body || "";
    setChapterBody(bodyVal);

    const parsed = bodyVal.split("<!-- pagebreak -->");
    setChapterPages(parsed);
    setCurrentPageIndex(0);

    if (editorRef.current) {
      isTypingRef.current = false;
      editorRef.current.innerHTML = parsed[0] || "";
    }
    setIsDirty(false);
  };

  const saveChapterContentSilent = async (index, titleVal, bodyVal) => {
    if (!book) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    const updatedChapters = [...book.chapters];
    updatedChapters[index] = {
      ...updatedChapters[index],
      title: titleVal,
      body: bodyVal,
    };

    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chapters: updatedChapters }),
      });

      if (response.ok) {
        const data = await response.json();
        setBook(data);
        setIsDirty(false);
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error("Autosave error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveActiveChapter = async () => {
    if (activeChapterIndex === -1 || !book) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    const updatedChapters = [...book.chapters];
    updatedChapters[activeChapterIndex] = {
      ...updatedChapters[activeChapterIndex],
      title: chapterTitle,
      body: chapterBody,
    };

    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chapters: updatedChapters }),
      });

      if (!response.ok) throw new Error("Failed to save draft");

      const data = await response.json();
      setBook(data);
      setIsDirty(false);
      setLastSaved(new Date());
      toast.success("Draft saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not save chapter changes.");
    } finally {
      setSaving(false);
    }
  };

  // Trigger Outline generation form modal
  const openOutlineModal = () => {
    setOutlineParams({
      topic: book?.title || "",
      audience: "General Audience",
      tone: "Professional",
      length: "5 Chapters",
    });
    setIsOutlineModalOpen(true);
  };

  const handleGenerateOutline = async () => {
    if (!book) return;
    if ((user?.subscriptionTier || 'free') === 'free') {
      setIsOutlineModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsOutlineModalOpen(false);
    setGenerationType("outline");
    setGenerationStep(0);
    setIsGenerating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/generate-outline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: outlineParams.topic || book.title,
          description: `Target Audience: ${outlineParams.audience}. Writing Tone: ${outlineParams.tone}. Outline Length: ${outlineParams.length}. Original description: ${book.description}`,
          audience: outlineParams.audience,
          style: outlineParams.tone,
          length: outlineParams.length,
        }),
      });

      if (!response.ok) throw new Error("AI Generation failed");

      const data = await response.json();
      const mappedChapters = data.chapters.map((ch) => ({
        title: ch.title,
        body: "",
      }));

      // Update database
      const saveResponse = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chapters: mappedChapters }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save generated outline");

      const updatedBook = await saveResponse.json();
      setBook(updatedBook);
      toast.success("eBook outline generated!");
      
      if (updatedBook.chapters.length > 0) {
        setActiveChapterIndex(0);
        setChapterTitle(updatedBook.chapters[0].title);
        updateEditorContent("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Outline generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftWithAI = async () => {
    if (activeChapterIndex === -1 || !book) return;
    if ((user?.subscriptionTier || 'free') === 'free') {
      setIsUpgradeModalOpen(true);
      return;
    }

    const activeCh = book.chapters[activeChapterIndex];
    setAiDrafting(true);
    setGenerationType("chapter");
    setGenerationStep(0);
    setIsGenerating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/generate-chapter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: book.title,
          chapterTitle: activeCh.title,
          chapterSummary: activeCh.summary || "",
          writingStyle: outlineParams.tone || "Professional",
        }),
      });

      if (!response.ok) throw new Error("AI drafting failed");

      const data = await response.json();
      updateEditorContent(data.content);
      await saveChapterContentSilent(activeChapterIndex, chapterTitle, data.content);
      toast.success("Chapter drafted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("AI drafting failed. Try again.");
    } finally {
      setAiDrafting(false);
      setIsGenerating(false);
    }
  };

  const handleAddChapter = async () => {
    if (!book) return;
    const token = localStorage.getItem("token");
    const nextChapterNumber = book.chapters.length + 1;
    const newCh = {
      title: `Chapter ${nextChapterNumber}: Untitled Chapter`,
      body: "",
    };
    const updatedChapters = [...book.chapters, newCh];

    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chapters: updatedChapters }),
      });

      if (!response.ok) throw new Error("Failed to add chapter");

      const data = await response.json();
      setBook(data);
      const newIndex = data.chapters.length - 1;
      await selectChapter(newIndex);
      toast.success("New chapter added");
    } catch (err) {
      console.error(err);
      toast.error("Could not add chapter.");
    }
  };

  // Text formatting actions via execCommand
  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newHTML = editorRef.current.innerHTML;
      const updatedPages = [...chapterPages];
      updatedPages[currentPageIndex] = newHTML;
      setChapterPages(updatedPages);
      
      const fullBody = updatedPages.join("<!-- pagebreak -->");
      setChapterBody(fullBody);
      setIsDirty(true);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      handleFormat("createLink", url);
    }
  };

  const handleInput = (e) => {
    isTypingRef.current = true;
    const currentHTML = e.currentTarget.innerHTML;
    const updatedPages = [...chapterPages];
    updatedPages[currentPageIndex] = currentHTML;
    setChapterPages(updatedPages);
    
    const fullBody = updatedPages.join("<!-- pagebreak -->");
    setChapterBody(fullBody);
    setIsDirty(true);
  };

  const updateEditorContent = (newHTML) => {
    if (editorRef.current) {
      isTypingRef.current = false;
      editorRef.current.innerHTML = newHTML;
    }
    const updatedPages = [...chapterPages];
    updatedPages[currentPageIndex] = newHTML;
    setChapterPages(updatedPages);
    
    const fullBody = updatedPages.join("<!-- pagebreak -->");
    setChapterBody(fullBody);
    setIsDirty(true);
  };

  // Pagination page actions
  const selectPage = (pIdx) => {
    if (pIdx < 0 || pIdx >= chapterPages.length) return;
    setCurrentPageIndex(pIdx);
    if (editorRef.current) {
      isTypingRef.current = false;
      editorRef.current.innerHTML = chapterPages[pIdx] || "";
    }
  };

  const handleAddPage = () => {
    const updatedPages = [...chapterPages];
    updatedPages.splice(currentPageIndex + 1, 0, "<p>Start writing on this new page...</p>");
    setChapterPages(updatedPages);
    
    const fullBody = updatedPages.join("<!-- pagebreak -->");
    setChapterBody(fullBody);
    setIsDirty(true);

    const nextIndex = currentPageIndex + 1;
    setCurrentPageIndex(nextIndex);
    setTimeout(() => {
      if (editorRef.current) {
        isTypingRef.current = false;
        editorRef.current.innerHTML = updatedPages[nextIndex] || "";
      }
    }, 50);
    toast.success("New page added to chapter");
  };

  const handleDeletePage = () => {
    if (chapterPages.length <= 1) {
      toast.error("A chapter must contain at least one page.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    const updatedPages = [...chapterPages];
    updatedPages.splice(currentPageIndex, 1);
    
    const nextIndex = Math.max(0, currentPageIndex - 1);
    setChapterPages(updatedPages);
    setCurrentPageIndex(nextIndex);
    
    const fullBody = updatedPages.join("<!-- pagebreak -->");
    setChapterBody(fullBody);
    setIsDirty(true);

    setTimeout(() => {
      if (editorRef.current) {
        isTypingRef.current = false;
        editorRef.current.innerHTML = updatedPages[nextIndex] || "";
      }
    }, 50);
    toast.success("Page deleted");
  };

  const replaceSelection = (newHTML) => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement("div");
        el.innerHTML = newHTML;
        const frag = document.createDocumentFragment();
        let node;
        while ((node = el.firstChild)) {
          frag.appendChild(node);
        }
        range.insertNode(frag);
        if (editorRef.current) {
          updateEditorContent(editorRef.current.innerHTML);
        }
      }
    }
  };

  // AI Copyedit Actions (rewrite, expand, shorten, grammar, tone)
  const handleAIExtension = async (action, toneVal = null) => {
    if (activeChapterIndex === -1 || !book) return;
    if ((user?.subscriptionTier || 'free') === 'free') {
      setIsUpgradeModalOpen(true);
      return;
    }

    const targetText = selectedText || chapterBody;
    if (!targetText.replace(/<[^>]*>/g, "").trim()) {
      toast.error("Write some text first, or highlight content to command AI.");
      return;
    }

    setAiDrafting(true);
    setGenerationType("chapter");
    setGenerationStep(0);
    setIsGenerating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/edit-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          text: targetText,
          tone: toneVal,
        }),
      });

      if (!response.ok) throw new Error("AI edit failed");

      const data = await response.json();
      if (selectedText) {
        replaceSelection(data.content);
        toast.success("Selection updated by AI!");
      } else {
        updateEditorContent(data.content);
        await saveChapterContentSilent(activeChapterIndex, chapterTitle, data.content);
        toast.success("Chapter updated by AI!");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI edit operation failed.");
    } finally {
      setAiDrafting(false);
      setIsGenerating(false);
    }
  };

  // AI Chat Submission
  const handleSendAIChat = async (customPrompt = null) => {
    if ((user?.subscriptionTier || 'free') === 'free') {
      setIsUpgradeModalOpen(true);
      return;
    }
    const query = customPrompt || aiChatInput;
    if (!query.trim()) return;

    if (!customPrompt) {
      setAiChatInput("");
    }

    setAiChatHistory((prev) => [...prev, { sender: "user", text: query }]);
    setIsAiChatLoading(true);

    const token = localStorage.getItem("token");
    const targetContext = selectedText || chapterBody;

    try {
      const response = await fetch(`${API_AI}/edit-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "chat",
          text: targetContext,
          instruction: query,
        }),
      });

      if (!response.ok) throw new Error("AI Chat failed");

      const data = await response.json();
      setAiChatHistory((prev) => [...prev, { sender: "ai", text: data.content }]);
    } catch (err) {
      console.error(err);
      setAiChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: "<p className='text-rose-550 font-semibold'>Failed to retrieve AI answer. Try again.</p>" }
      ]);
    } finally {
      setIsAiChatLoading(false);
    }
  };

  const handleSuggestionClick = (pill) => {
    const target = selectedText ? "selected text" : "current chapter";
    let promptText = "";
    if (pill === "Explain this") promptText = `Explain the concept in this ${target}`;
    else if (pill === "Generate Example") promptText = `Generate a code snippet or real world analogy illustrating this ${target}`;
    else if (pill === "Make Simpler") promptText = `Simplify the writing and explanation inside this ${target}`;
    else if (pill === "Summarize") promptText = `Summarize the following ${target} in 3 bullet points`;
    
    handleSendAIChat(promptText);
  };

  // Save modified cover configuration
  const handleSaveCover = async () => {
    const token = localStorage.getItem("token");
    const coverObj = {
      gradient: tempGradient,
      style: tempStyle,
      subtitle: tempSubtitle,
      title: tempTitle,
      imageUrl: tempImageUrl,
    };
    const coverImageStr = JSON.stringify(coverObj);

    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coverImage: coverImageStr }),
      });

      if (!response.ok) throw new Error("Failed to save cover image");

      const updatedBook = await response.json();
      setBook(updatedBook);
      setCoverConfig(coverObj);
      setIsCoverModalOpen(false);
      toast.success("eBook Cover designs saved!");
    } catch (err) {
      console.error(err);
      toast.error("Could not save cover modifications.");
    }
  };

  // Save modified export configurations
  const handleSaveExportConfig = async (newConfig) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ exportConfig: newConfig }),
      });

      if (!response.ok) throw new Error("Failed to save export configuration");

      const updatedBook = await response.json();
      setBook(updatedBook);
      setIsExportModalOpen(false);
      toast.success("eBook layout templates saved!");
    } catch (err) {
      console.error(err);
      toast.error("Could not save export templates configuration.");
    }
  };

  // Export Book formats
  const handleExport = (format, customConfig = null) => {
    setExportDropdownOpen(false);
    if (!book || !book.chapters || book.chapters.length === 0) {
      toast.error("eBook outline is empty. Write chapters first.");
      return;
    }

    // Load styling config
    const config = customConfig || book.exportConfig || {
      pageSize: "letter",
      marginStyle: "normal",
      customMargins: { top: 1, bottom: 1, left: 1, right: 1 },
      fontFamily: "Lora",
      fontSize: 16,
      lineHeight: 1.6,
      textAlignment: "justify",
      includeCover: true,
      includeTOC: true,
      chapterPageBreaks: true,
      headerStyle: "title-chapter",
      footerStyle: "page-center"
    };

    const fontStackMap = {
      Lora: "'Lora', Georgia, serif",
      Georgia: "Georgia, serif",
      "Playfair Display": "'Playfair Display', Georgia, serif",
      Outfit: "'Outfit', 'Inter', sans-serif",
      Inter: "'Inter', sans-serif",
    };
    const fontCss = fontStackMap[config.fontFamily] || "Georgia, serif";

    if (format === "markdown") {
      let content = `# ${book.title}\n\n`;
      if (book.description) {
        content += `> ${book.description}\n\n`;
      }
      book.chapters.forEach((ch) => {
        const cleanBody = ch.body
          .replace(/<h2>(.*?)<\/h2>/g, "\n## $1\n")
          .replace(/<h3>(.*?)<\/h3>/g, "\n### $1\n")
          .replace(/<p>(.*?)<\/p>/g, "\n$1\n")
          .replace(/<li>(.*?)<\/li>/g, "\n* $1")
          .replace(/<ul>/g, "")
          .replace(/<\/ul>/g, "")
          .replace(/<ol>/g, "")
          .replace(/<\/ol>/g, "")
          .replace(/<blockquote>(.*?)<\/blockquote>/g, "\n> $1\n")
          .replace(/<pre><code>(.*?)<\/code><\/pre>/g, "\n```\n$1\n```\n")
          .replace(/<[^>]*>/g, ""); // fallback tags strip
        content += `## ${ch.title}\n\n${cleanBody}\n\n`;
      });

      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.title.replace(/\s+/g, "_")}.md`;
      link.click();
      toast.success("Markdown exported!");
    } else if (format === "html" || format === "pdf") {
      const printWindow = window.open("", "_blank");
      
      // Determine page margins
      let marginRule = "margin: 1in;";
      if (config.marginStyle === "compact") marginRule = "margin: 0.5in;";
      else if (config.marginStyle === "wide") marginRule = "margin: 1.5in;";
      else if (config.marginStyle === "custom" && config.customMargins) {
        marginRule = `margin: ${config.customMargins.top}in ${config.customMargins.right}in ${config.customMargins.bottom}in ${config.customMargins.left}in;`;
      }

      // Determine page size
      let sizeRule = "size: letter;";
      if (config.pageSize === "a4") sizeRule = "size: A4;";
      else if (config.pageSize === "a5") sizeRule = "size: A5;";
      else if (config.pageSize === "pocket") sizeRule = "size: 5in 8in;";

      let fullHTML = `<html><head><title>${book.title}</title>`;
      
      // Preload Google Fonts link tag
      fullHTML += `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
      `;

      // CSS styles
      fullHTML += `<style>
        @page {
          ${sizeRule}
          ${marginRule}
        }
        body { 
          font-family: ${fontCss}; 
          font-size: ${config.fontSize}px;
          line-height: ${config.lineHeight}; 
          color: #1e293b; 
          background: #ffffff;
        }
        h1 { 
          text-align: center; 
          font-size: 2.75em; 
          margin-bottom: 2em; 
          font-family: 'Playfair Display', Georgia, serif; 
          font-weight: 800; 
          color: #0f172a; 
        }
        h2 { 
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2em; 
          margin-top: 1.5em; 
          border-bottom: 2px solid #e2e8f0; 
          padding-bottom: 0.4em; 
          color: #0f172a; 
        }
        h3 { 
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.4em; 
          margin-top: 1.5em; 
          color: #1e293b; 
        }
        p { 
          margin-bottom: 1.25em; 
          text-align: ${config.textAlignment === "justify" ? "justify" : "left"}; 
          text-justify: inter-word; 
        }
        blockquote { 
          border-left: 4px solid #7c3aed; 
          padding-left: 1.25rem; 
          color: #4b5563; 
          font-style: italic; 
          margin: 1.5rem 0; 
        }
        pre { 
          background: #f3f4f6; 
          padding: 1.25rem; 
          border-radius: 8px; 
          overflow-x: auto; 
          font-family: monospace; 
          font-size: 0.9em; 
          margin: 1.5rem 0; 
        }
        ul, ol { padding-left: 1.75rem; margin-bottom: 1.25rem; }
        li { margin-bottom: 0.5rem; }
        .page-break { page-break-before: always; }

        /* Running header/footer styles */
        .print-header {
          display: ${config.headerStyle === "none" ? "none" : "flex"};
          justify-content: space-between;
          font-size: 9px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
          margin-bottom: 24px;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .print-footer {
          display: ${config.footerStyle === "none" ? "none" : "block"};
          text-align: ${config.footerStyle === "page-right" ? "right" : "center"};
          font-size: 9px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          margin-top: 24px;
          font-family: monospace;
        }

        /* Cover styles */
        .print-cover {
          height: 95vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
          background: ${coverConfig?.gradient || "linear-gradient(135deg, #1f2937, #111827)"};
          color: #ffffff;
          padding: 3in 1.5in 1.5in 1.5in;
          page-break-after: always;
          box-sizing: border-box;
        }
        .print-cover-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 1.2;
          color: #ffffff;
          margin: 0;
        }
        .print-cover-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.8;
          margin-top: 12px;
          margin-bottom: 12px;
        }
        .print-cover-author {
          font-family: 'Lora', Georgia, serif;
          font-size: 18px;
          font-style: italic;
          opacity: 0.9;
        }
        .print-cover-footer {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.5;
        }

        /* TOC styles */
        .print-toc {
          page-break-after: always;
          padding: 1in 0.5in;
        }
        .print-toc-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2.5em;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 0.5em;
        }
        .print-toc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          font-size: 13px;
          color: #334155;
        }
        .print-toc-dots {
          flex: 1;
          border-bottom: 1px dashed #94a3b8;
          margin: 0 10px;
          height: 10px;
        }
      </style></head><body>`;

      // 1. Cover Page
      if (config.includeCover) {
        fullHTML += `
          <div class="print-cover">
            <div>
              <div class="print-cover-subtitle">${coverConfig.subtitle || "EBOOK SPECIFICATION"}</div>
              <h1 class="print-cover-title">${coverConfig.title || book.title}</h1>
            </div>
            <div>
              <div class="print-cover-author">by ${user?.username || "Writer"}</div>
            </div>
            <div class="print-cover-footer">Published with eBookAI</div>
          </div>
        `;
      }

      // 2. Table of Contents
      if (config.includeTOC) {
        fullHTML += `
          <div class="print-toc">
            <h2 class="print-toc-title">Table of Contents</h2>
            <div style="margin-top: 20px;">
              ${book.chapters.map((ch, idx) => `
                <div class="print-toc-item">
                  <span>Chapter ${idx + 1}: ${ch.title}</span>
                  <span class="print-toc-dots"></span>
                  <span style="font-family: monospace;">${idx * 3 + 4}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      // 3. Chapters
      book.chapters.forEach((ch, idx) => {
        const breakClass = (config.chapterPageBreaks && (idx > 0 || config.includeCover || config.includeTOC)) ? "page-break" : "";
        fullHTML += `<div class="${breakClass}" style="margin-bottom: 1.5in;">`;
        
        // Running Header
        if (config.headerStyle === "title-chapter") {
          fullHTML += `
            <div class="print-header">
              <span>${book.title}</span>
              <span>Chapter ${idx + 1}: ${ch.title}</span>
            </div>
          `;
        }
        
        fullHTML += `<h2>${ch.title}</h2>`;
        fullHTML += `<div style="text-align: ${config.textAlignment === "justify" ? "justify" : "left"};">${ch.body}</div>`;
        
        // Running Footer
        if (config.footerStyle !== "none") {
          fullHTML += `
            <div class="print-footer">
              Page ${idx + 1 + (config.includeTOC ? 3 : 0) + (config.includeCover ? 1 : 0)}
            </div>
          `;
        }

        fullHTML += `</div>`;
      });

      fullHTML += `</body></html>`;

      printWindow.document.write(fullHTML);
      printWindow.document.close();
      if (format === "pdf") {
        printWindow.print();
      }
      toast.success(format === "pdf" ? "PDF print overlay opened!" : "HTML Document exported!");
    } else if (format === "docx") {
      const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${book.title}</title>
          <style>
            body { 
              font-family: ${fontCss}; 
              font-size: ${config.fontSize}px; 
              line-height: ${config.lineHeight};
            }
          </style>
        </head>
        <body>
          <h1>${book.title}</h1>
          ${book.chapters.map(ch => `<h2>${ch.title}</h2><div style="text-align: ${config.textAlignment === "justify" ? "justify" : "left"};">${ch.body}</div>`).join("")}
        </body>
      </html>`;
      
      const blob = new Blob([docHtml], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.title.replace(/\s+/g, "_")}.doc`;
      link.click();
      toast.success("DOCX exported!");
    } else if (format === "epub") {
      const docHtml = `<html>
        <head>
          <meta charset="utf-8">
          <title>${book.title}</title>
          <style>
            body { 
              font-family: ${fontCss}; 
              font-size: ${config.fontSize}px; 
              line-height: ${config.lineHeight};
            }
          </style>
        </head>
        <body>
          <h1>${book.title}</h1>
          ${book.chapters.map(ch => `<h3>${ch.title}</h3><div style="text-align: ${config.textAlignment === "justify" ? "justify" : "left"};">${ch.body}</div>`).join("<hr/>")}
        </body>
      </html>`;
      
      const blob = new Blob([docHtml], { type: "application/epub+zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.title.replace(/\s+/g, "_")}.epub`;
      link.click();
      toast.success("EPUB exported!");
    }
  };

  // Word statistics calculation
  const cleanBody = chapterBody ? chapterBody.replace(/<!-- pagebreak -->/g, " ") : "";
  const wordCount = cleanBody ? cleanBody.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const charCount = cleanBody ? cleanBody.replace(/<[^>]*>/g, "").length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const pageContent = chapterPages[currentPageIndex] || "";
  const pageWordCount = pageContent ? pageContent.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const pageCharCount = pageContent ? pageContent.replace(/<[^>]*>/g, "").length : 0;

  // Auto-saved relative time text helper
  const getSavedLabel = () => {
    if (saving) return "Saving changes...";
    if (isDirty) return "Unsaved changes";
    if (lastSaved) {
      const hrs = String(lastSaved.getHours()).padStart(2, '0');
      const mins = String(lastSaved.getMinutes()).padStart(2, '0');
      const secs = String(lastSaved.getSeconds()).padStart(2, '0');
      return `Saved ✓ (${hrs}:${mins}:${secs})`;
    }
    return "Saved";
  };

  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col font-sans antialiased select-text overflow-hidden transition-colors duration-250">
      
      {/* Editor CSS Formatting styles injection */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-primary);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        .editor-content [contenteditable]:empty:before {
          content: attr(placeholder);
          color: var(--text-muted);
          pointer-events: none;
          display: block;
        }
        .editor-content blockquote {
          border-left: 4px solid var(--accent-primary);
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: var(--text-secondary);
        }
        .editor-content pre {
          background-color: var(--bg-tertiary);
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          overflow-x: auto;
          font-size: 0.85rem;
          margin: 1rem 0;
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
        }
        .editor-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .editor-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .editor-content h2 {
          font-size: 1.35rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
        }
        .editor-content h3 {
          font-size: 1.15rem;
          font-weight: 500;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
        }
        .editor-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .editor-content a {
          color: var(--accent-primary);
          text-decoration: underline;
        }
      `}</style>

      {/* Editor Header Bar */}
      <header className="h-16 bg-bg-secondary border-b border-border-primary px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 transition-colors duration-250">
        <div className="flex items-center gap-3">
          {/* Left Sidebar Collapse toggle */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-all cursor-pointer bg-transparent border-none"
            title="Toggle left sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            to="/dashboard"
            className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest"
          >
            Library
          </Link>
          <span className="text-border-primary">|</span>
          <Link
            to="/discover"
            className="text-text-muted hover:text-accent-primary transition-colors flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest"
          >
            Discover
          </Link>
          <span className="text-border-primary">|</span>
          <Link
            to="/profile"
            className="text-text-muted hover:text-accent-primary transition-colors flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest"
          >
            Profile
          </Link>
          <span className="text-border-primary">|</span>
          <span className="text-text-primary text-xs font-semibold max-w-[200px] truncate block">
            {book?.title || "Loading eBook..."}
          </span>
        </div>

        {/* Action Controls & Saving status */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <span className="text-[10px] font-semibold tracking-wider text-text-muted">
            {getSavedLabel()}
          </span>

          {activeChapterIndex !== -1 && (
            <>
              {/* Draft Chapter with AI */}
              <button
                onClick={handleDraftWithAI}
                disabled={aiDrafting || saving}
                className="h-[34px] px-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-[10px] font-bold tracking-wider rounded-lg transition-all flex items-center gap-1.5 uppercase cursor-pointer disabled:opacity-50 border-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Draft AI
              </button>

              {/* Export Settings */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="h-[34px] px-3.5 border border-border-primary hover:border-text-primary text-text-secondary hover:text-text-primary active:scale-[0.98] text-[10px] font-bold tracking-wider rounded-lg transition-all flex items-center gap-1.5 uppercase cursor-pointer bg-transparent"
              >
                ⚙️ Export Settings
              </button>

              {/* Manual Save */}
              <button
                onClick={handleSaveActiveChapter}
                disabled={saving || aiDrafting}
                className="h-[34px] px-3.5 bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.98] text-[10px] font-bold tracking-wider rounded-lg transition-all uppercase cursor-pointer disabled:opacity-50"
              >
                Save
              </button>
            </>
          )}

          {/* Right Sidebar toggle */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            title="Toggle AI Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Editor Body Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-bg-primary">
          <div className="w-8 h-8 border-4 border-border-primary border-t-accent-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 flex relative overflow-hidden h-[calc(100vh-4rem)]">
          
          {/* LEFT SIDEBAR: Cover art + Progress TOC */}
          <aside
            className={`bg-bg-secondary border-r border-border-primary flex flex-col justify-between shrink-0 transition-all duration-300 overflow-hidden text-text-primary ${
              leftSidebarOpen ? "w-[260px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
              
              {/* Premium Book Cover Card Preview */}
              <div className="bg-bg-tertiary/50 rounded-2xl p-3.5 border border-border-primary flex flex-col items-center">
                <BookCover
                  config={coverConfig}
                  title={book?.title || ""}
                  author={user?.username || "Writer"}
                  className="w-[120px]"
                />
                <button
                  onClick={() => setIsCoverModalOpen(true)}
                  className="mt-3 text-[9px] font-bold text-text-secondary hover:text-text-primary tracking-wider uppercase border border-border-primary hover:border-text-primary px-3 py-1.5 rounded-lg bg-bg-primary shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  ✨ AI Cover Builder
                </button>
              </div>

              {/* Table of Contents List */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between pl-2 mb-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-text-muted">
                    Table of Contents
                  </span>
                  
                  {book.chapters && book.chapters.length > 0 && (
                    <button
                      onClick={openOutlineModal}
                      className="text-[8px] font-bold text-accent-primary hover:text-accent-hover uppercase tracking-wider cursor-pointer"
                      title="Reset and regenerate outline with AI parameters"
                    >
                      Re-Outline
                    </button>
                  )}
                </div>
                
                {book.chapters && book.chapters.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {book.chapters.map((ch, idx) => {
                      const isCompleted = ch.body && ch.body.replace(/<[^>]*>/g, "").trim().length > 10;
                      const isActive = idx === activeChapterIndex;
 
                      return (
                        <button
                          key={ch._id || idx}
                          onClick={() => selectChapter(idx)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 border text-xs cursor-pointer flex items-center gap-2.5 ${
                            isActive
                              ? "bg-slate-900 border-slate-950 text-white shadow-md shadow-slate-900/10 font-medium"
                              : "bg-transparent border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                          }`}
                        >
                          {/* Progress state bullet */}
                          <div className="shrink-0">
                            {isCompleted ? (
                              <span className={`text-[11px] ${isActive ? "text-emerald-400" : "text-emerald-600"}`}>✓</span>
                            ) : isActive ? (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-ring opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
                              </span>
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full border border-border-primary"></div>
                            )}
                          </div>

                          <div className="truncate flex-1">
                            <span className="block truncate font-semibold text-[11px]">
                              {ch.title || `Chapter ${idx + 1}`}
                            </span>
                            {!isActive && ch.body && (
                              <span className="text-[9px] text-text-muted block truncate">
                                {ch.body.replace(/<[^>]*>/g, "").substring(0, 30)}...
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-bg-tertiary/50 border border-dashed border-border-primary rounded-xl text-text-muted text-[10px] font-semibold">
                    No chapters defined.
                  </div>
                )}
              </div>
            </div>
 
            {/* Left Sidebar Footer */}
            {book.chapters && book.chapters.length > 0 && (
              <div className="p-4 border-t border-border-primary bg-bg-secondary">
                <button
                  onClick={handleAddChapter}
                  className="w-full h-[36px] border border-dashed border-border-primary hover:border-text-primary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all rounded-xl text-[9px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Chapter
                </button>
              </div>
            )}
          </aside>

          {/* CENTER PANEL: Writing Workspace & Sticky Toolbar */}
          <main className="flex-1 bg-bg-primary overflow-y-auto custom-scrollbar flex flex-col justify-between border-r border-border-primary">
            
            {book.chapters && book.chapters.length === 0 ? (
              /* Outline Generator Empty State */
              <div className="m-auto w-full max-w-[450px] bg-bg-secondary border border-border-primary rounded-[28px] p-8 sm:p-12 text-center shadow-xl shadow-slate-900/[0.02] flex flex-col items-center animate-fadeIn">
                <div className="h-12 w-12 bg-emerald-50/10 border border-emerald-100/20 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="font-display font-light text-2xl text-text-primary mb-2">
                  Outline with AI
                </h3>
                <p className="text-text-muted text-xs font-medium mb-8 leading-relaxed max-w-[320px]">
                  Provide a topic, audience scope, and tone parameters to outline a complete Table of Contents outline.
                </p>
                <Button
                  onClick={openOutlineModal}
                  className="h-[42px] bg-accent-primary hover:bg-accent-hover border-none text-[10px] font-bold tracking-wider rounded-xl transition-all px-8 uppercase flex items-center gap-2 cursor-pointer text-white"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Outline
                </Button>
              </div>
            ) : activeChapterIndex === -1 ? (
              <div className="m-auto text-text-muted text-xs font-semibold">
                Select a chapter from the Table of Contents to begin editing.
              </div>
            ) : (
              /* Writing Workspace Panel */
              <div className="flex-1 flex flex-col justify-between">
                
                {/* HTML Custom Formatting Toolbar */}
                <div className="h-11 bg-bg-secondary border-b border-border-primary px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("formatBlock", "<h2>"); }}
                      className="p-1 px-2 text-[10px] font-bold text-text-secondary hover:bg-bg-tertiary rounded-md transition-colors"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("formatBlock", "<h3>"); }}
                      className="p-1 px-2 text-[10px] font-bold text-text-secondary hover:bg-bg-tertiary rounded-md transition-colors"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <div className="w-px h-3.5 bg-border-primary mx-0.5"></div>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("bold"); }}
                      className="p-1.5 text-xs text-text-secondary hover:bg-bg-tertiary rounded-md font-bold transition-colors"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("italic"); }}
                      className="p-1.5 text-xs text-text-secondary hover:bg-bg-tertiary rounded-md italic transition-colors"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("formatBlock", "<blockquote>"); }}
                      className="p-1.5 text-xs text-text-secondary hover:bg-bg-tertiary rounded-md transition-colors font-mono"
                      title="Blockquote"
                    >
                      “
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("formatBlock", "<pre>"); }}
                      className="p-1 px-1.5 text-[9px] text-text-secondary hover:bg-bg-tertiary rounded-md transition-colors font-mono font-bold"
                      title="Code Block"
                    >
                      &lt;/&gt;
                    </button>
                    <div className="w-px h-3.5 bg-border-primary mx-0.5"></div>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("insertUnorderedList"); }}
                      className="p-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("insertOrderedList"); }}
                      className="p-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Numbered List"
                    >
                      1. List
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleInsertLink(); }}
                      className="p-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-semibold"
                      title="Insert Link"
                    >
                      Link
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleFormat("removeFormat"); }}
                      className="p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors"
                      title="Clear Formatting"
                    >
                      Clear
                    </button>
                  </div>

                  {selectedText && (
                    <div className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md animate-fadeIn shrink-0">
                      Selection Active
                    </div>
                  )}
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 px-8 sm:px-12 py-8 max-w-[760px] w-full mx-auto flex flex-col justify-start">
                  
                  {/* Chapter Title Input */}
                  <textarea
                    value={chapterTitle}
                    onChange={(e) => {
                      setChapterTitle(e.target.value.replace(/\n/g, ""));
                      setIsDirty(true);
                    }}
                    rows={2}
                    className="w-full font-display font-light text-xl sm:text-2xl text-text-primary tracking-tight mb-4 bg-transparent border-none outline-none placeholder-text-muted focus:placeholder-text-secondary resize-none h-[64px]"
                    placeholder="Chapter Title..."
                    disabled={aiDrafting}
                  />

                  {/* Rich Text Editor Container */}
                  <div className="relative w-full flex-1 flex flex-col editor-content">
                    {aiDrafting && (
                      <div className="absolute inset-0 bg-bg-primary/50 backdrop-blur-xs z-10 flex flex-col items-center justify-center gap-3">
                        {/* Empty spinner placeholder (staged overlay is shown separately) */}
                      </div>
                    )}
                    
                    <div
                      ref={editorRef}
                      contentEditable={!aiDrafting}
                      suppressContentEditableWarning
                      onInput={handleInput}
                      className="w-full flex-1 bg-transparent border-none outline-none font-sans text-text-primary text-sm leading-relaxed placeholder-text-muted min-h-[420px] focus:outline-none"
                      placeholder="Start typing your chapter contents or click 'Draft AI' to auto-generate content..."
                    />
                  </div>

                          <div className="mt-4 pt-4 border-t border-border-primary flex items-center justify-between text-xs font-semibold text-text-secondary bg-bg-secondary/50 px-4 py-2.5 rounded-xl shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectPage(currentPageIndex - 1)}
                        disabled={currentPageIndex === 0}
                        className="p-1 px-2.5 border border-border-primary hover:border-text-primary disabled:opacity-30 disabled:hover:border-border-primary rounded-lg transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-text-secondary hover:text-text-primary bg-bg-primary"
                      >
                        ← Prev
                      </button>
                      
                      <div className="flex items-center gap-1.5 mx-2">
                        {chapterPages.map((_, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => selectPage(pIdx)}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                              pIdx === currentPageIndex ? "bg-text-primary scale-125 shadow-xs" : "bg-border-primary hover:bg-text-muted"
                            }`}
                            title={`Go to Page ${pIdx + 1}`}
                          />
                        ))}
                      </div>
 
                      <button
                        onClick={() => selectPage(currentPageIndex + 1)}
                        disabled={currentPageIndex === chapterPages.length - 1}
                        className="p-1 px-2.5 border border-border-primary hover:border-text-primary disabled:opacity-30 disabled:hover:border-border-primary rounded-lg transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-text-secondary hover:text-text-primary bg-bg-primary"
                      >
                        Next →
                      </button>
                    </div>
 
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        Page {currentPageIndex + 1} of {chapterPages.length}
                      </span>
                      <div className="w-px h-3.5 bg-border-primary mx-1"></div>
                      <button
                        onClick={handleAddPage}
                        className="p-1 px-2 text-[10px] text-accent-primary hover:text-accent-hover hover:bg-accent-primary/10 border border-transparent hover:border-accent-primary/20 rounded-lg transition-all cursor-pointer font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        + Add Page
                      </button>
                      {chapterPages.length > 1 && (
                        <button
                          onClick={handleDeletePage}
                          className="p-1 px-2 text-[10px] text-rose-600 hover:text-rose-850 hover:bg-rose-500/10 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer font-bold uppercase tracking-wider flex items-center gap-1"
                          title="Delete current page"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
 
                </div>
 
                {/* BOTTOM STATS BAR */}
                <div className="h-9 bg-bg-secondary border-t border-border-primary px-6 flex items-center justify-between text-[10px] text-text-muted font-medium">
                  <div className="flex items-center gap-4">
                    <span>Chapter Words: <strong className="text-text-secondary">{wordCount}</strong> <span className="opacity-50">(Page: {pageWordCount})</span></span>
                    <span>Chapter Chars: <strong className="text-text-secondary">{charCount}</strong> <span className="opacity-50">(Page: {pageCharCount})</span></span>
                  </div>
                  <div>
                    <span>Est. Reading Time: <strong className="text-text-secondary">{readingTime} min</strong></span>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR: AI Assistant & Checklist */}
          <aside
            className={`bg-bg-secondary border-l border-border-primary flex flex-col justify-between shrink-0 transition-all duration-300 overflow-hidden text-text-primary ${
              rightSidebarOpen ? "w-[320px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="flex flex-col h-full divide-y divide-border-primary min-h-0 overflow-hidden">
              
              {/* AI Copilot Writing Actions */}
              <div className="p-4 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-text-muted">
                    AI Assistant
                  </span>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50/10 px-1.5 py-0.5 rounded font-mono">
                    {selectedText ? "SELECTED BLOCK" : "WHOLE CHAPTER"}
                  </span>
                </div>
 
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAIExtension("rewrite")}
                    disabled={aiDrafting || activeChapterIndex === -1}
                    className="py-2 px-3 border border-border-primary hover:border-text-primary text-[10px] font-bold tracking-wider text-text-secondary hover:text-text-primary rounded-lg text-center uppercase transition-all bg-bg-primary cursor-pointer disabled:opacity-50"
                  >
                    Rewrite
                  </button>
                  <button
                    onClick={() => handleAIExtension("expand")}
                    disabled={aiDrafting || activeChapterIndex === -1}
                    className="py-2 px-3 border border-border-primary hover:border-text-primary text-[10px] font-bold tracking-wider text-text-secondary hover:text-text-primary rounded-lg text-center uppercase transition-all bg-bg-primary cursor-pointer disabled:opacity-50"
                  >
                    Expand
                  </button>
                  <button
                    onClick={() => handleAIExtension("shorten")}
                    disabled={aiDrafting || activeChapterIndex === -1}
                    className="py-2 px-3 border border-border-primary hover:border-text-primary text-[10px] font-bold tracking-wider text-text-secondary hover:text-text-primary rounded-lg text-center uppercase transition-all bg-bg-primary cursor-pointer disabled:opacity-50"
                  >
                    Shorten
                  </button>
                  <button
                    onClick={() => handleAIExtension("grammar")}
                    disabled={aiDrafting || activeChapterIndex === -1}
                    className="py-2 px-3 border border-border-primary hover:border-text-primary text-[10px] font-bold tracking-wider text-text-secondary hover:text-text-primary rounded-lg text-center uppercase transition-all bg-bg-primary cursor-pointer disabled:opacity-50"
                  >
                    Fix Grammar
                  </button>
                </div>
 
                {/* Change Tone dropdown list */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                    Shift Writing Tone
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {["Professional", "Casual", "Academic", "Creative", "Friendly"].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleAIExtension("tone", t)}
                        disabled={aiDrafting || activeChapterIndex === -1}
                        className="text-[9px] font-semibold text-text-secondary hover:text-text-primary border border-border-primary hover:border-text-primary rounded-md px-2 py-1 bg-bg-tertiary/50 hover:bg-bg-tertiary transition-all cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Interactive Ask AI Chat Pane */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
                {/* Chat header */}
                <div className="px-4 py-2.5 bg-bg-tertiary/50 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                    Ask AI Co-Writer
                  </span>
                </div>
 
                {/* Chat Log history */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3 font-sans text-xs">
                  {aiChatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-0.5">
                        {msg.sender === "user" ? "You" : "AI"}
                      </span>
                      <div
                        className={`rounded-2xl px-3 py-2 border font-medium leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-accent-primary border-accent-primary text-white"
                            : "bg-bg-tertiary border-border-primary text-text-primary"
                        }`}
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                    </div>
                  ))}
                  {isAiChatLoading && (
                    <div className="flex flex-col max-w-[85%] mr-auto items-start">
                      <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-0.5 animate-pulse">
                        AI Thinking
                      </span>
                      <div className="rounded-2xl px-4 py-2.5 bg-bg-tertiary border border-border-primary flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
 
                {/* Suggestions Pills & Input */}
                <div className="p-3 bg-bg-secondary border-t border-border-primary flex flex-col gap-2 shrink-0">
                  
                  {/* Suggestions pills */}
                  <div className="flex flex-wrap gap-1 justify-start">
                    {["Explain this", "Generate Example", "Make Simpler", "Summarize"].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => handleSuggestionClick(pill)}
                        disabled={isAiChatLoading || activeChapterIndex === -1}
                        className="text-[9px] font-semibold bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
 
                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAIChat();
                    }}
                    className="relative flex items-center bg-bg-tertiary border border-border-primary rounded-xl overflow-hidden focus-within:border-text-primary transition-colors"
                  >
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder={selectedText ? "Ask about selected text..." : "Ask AI about this chapter..."}
                      disabled={isAiChatLoading || activeChapterIndex === -1}
                      className="w-full pl-3 pr-10 py-2.5 bg-transparent border-none text-xs outline-none placeholder-text-muted text-text-primary"
                    />
                    <button
                      type="submit"
                      disabled={isAiChatLoading || !aiChatInput.trim()}
                      className="absolute right-1.5 p-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-hover disabled:bg-bg-tertiary disabled:text-text-muted cursor-pointer transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </aside>

        </div>
      )}

      {/* MODAL 1: AI Outline Builder parameters Form */}
      {isOutlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-bg-primary rounded-[24px] border border-border-primary shadow-2xl p-6 sm:p-8 w-full max-w-[420px] mx-4 animate-scaleUp text-text-primary">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-display font-medium text-lg text-text-primary">
                Generate eBook Outline
              </h3>
            </div>
 
            <p className="text-text-secondary text-[11px] font-medium mb-5 leading-relaxed">
              Fine-tune the parameters below. The AI will structure a tailored Table of Contents reflecting these settings.
            </p>
 
            <div className="flex flex-col gap-4">
              {/* Topic Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                  eBook Topic
                </label>
                <input
                  type="text"
                  value={outlineParams.topic}
                  onChange={(e) => setOutlineParams({ ...outlineParams, topic: e.target.value })}
                  placeholder="e.g. Artificial Intelligence Basics"
                  className="w-full bg-bg-secondary border border-border-primary focus:border-text-primary rounded-xl px-3 py-2.5 text-xs outline-none text-text-primary"
                />
              </div>
 
              {/* Target Audience Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={outlineParams.audience}
                  onChange={(e) => setOutlineParams({ ...outlineParams, audience: e.target.value })}
                  placeholder="e.g. Students, Software Engineers"
                  className="w-full bg-bg-secondary border border-border-primary focus:border-text-primary rounded-xl px-3 py-2.5 text-xs outline-none text-text-primary"
                />
              </div>
 
              {/* Writing Style / Tone Dropdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                    Tone / Style
                  </label>
                  <select
                    value={outlineParams.tone}
                    onChange={(e) => setOutlineParams({ ...outlineParams, tone: e.target.value })}
                    className="w-full bg-bg-secondary border border-border-primary rounded-xl px-3 py-2.5 text-xs outline-none text-text-primary cursor-pointer"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Academic">Academic</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Casual">Casual</option>
                    <option value="Dramatic">Dramatic</option>
                  </select>
                </div>
 
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                    Outline Length
                  </label>
                  <select
                    value={outlineParams.length}
                    onChange={(e) => setOutlineParams({ ...outlineParams, length: e.target.value })}
                    className="w-full bg-bg-secondary border border-border-primary rounded-xl px-3 py-2.5 text-xs outline-none text-text-primary cursor-pointer"
                  >
                    <option value="3 Chapters">Short (3 Chapters)</option>
                    <option value="5 Chapters">Medium (5 Chapters)</option>
                    <option value="8 Chapters">Long (8 Chapters)</option>
                  </select>
                </div>
              </div>
            </div>
 
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOutlineModalOpen(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateOutline}
                className="px-5 py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Build Outline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI Cover Builder Editor */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-bg-primary rounded-[24px] border border-border-primary shadow-2xl p-6 sm:p-8 w-full max-w-[620px] mx-4 animate-scaleUp flex flex-col md:flex-row gap-6 text-text-primary">
            
            {/* Left Column: Cover preview */}
            <div className="flex-1 flex flex-col items-center justify-center bg-bg-tertiary rounded-2xl p-4 border border-border-primary">
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-3">
                Live Cover Preview
              </span>
              <BookCover
                config={{
                  gradient: tempGradient,
                  style: tempStyle,
                  subtitle: tempSubtitle,
                }}
                title={tempTitle}
                author={user?.username || "Writer"}
                className="w-[140px]"
              />
            </div>
 
            {/* Right Column: Controls */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-medium text-lg text-text-primary mb-1">
                  AI Cover Builder
                </h3>
                <p className="text-[10px] font-semibold mb-4 leading-relaxed uppercase tracking-wider text-text-muted">
                  Personalize your eBook Cover style
                </p>
 
                <div className="flex flex-col gap-3">
                  
                  {/* Title input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Cover Title
                    </label>
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      placeholder="eBook Title"
                      className="w-full bg-bg-secondary border border-border-primary rounded-lg px-2.5 py-2 text-xs outline-none text-text-primary"
                    />
                  </div>

                  {/* Subtitle input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Cover Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={tempSubtitle}
                      onChange={(e) => setTempSubtitle(e.target.value)}
                      placeholder="e.g. FIRST EDITION, DIGITAL PUBLICATION"
                      className="w-full bg-bg-secondary border border-border-primary rounded-lg px-2.5 py-2 text-xs outline-none text-text-primary"
                    />
                  </div>
 
                  {/* Layout Style dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Design Layout Style
                    </label>
                    <select
                      value={tempStyle}
                      onChange={(e) => setTempStyle(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-primary rounded-lg px-2.5 py-2 text-xs outline-none text-text-primary cursor-pointer font-medium"
                    >
                      <option value="modern">Modern (Default)</option>
                      <option value="editorial">Editorial Frame</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="geometric">Geometric Backdrop</option>
                    </select>
                  </div>
 
                  {/* Cover Image URL input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="w-full bg-bg-secondary border border-border-primary rounded-lg px-2.5 py-2 text-xs outline-none text-text-primary font-mono text-[10px]"
                    />
                  </div>
 
                  {/* Gradient picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Cover Background Color <span className="text-[8px] text-text-muted font-normal lowercase">(only if Image URL is empty)</span>
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { name: "Midnight Blue", grad: "linear-gradient(135deg, #0f172a, #1e3a8a)" },
                        { name: "Sunset Glow", grad: "linear-gradient(135deg, #f97316, #e11d48)" },
                        { name: "Emerald Forest", grad: "linear-gradient(135deg, #065f46, #0f766e)" },
                        { name: "Cosmic Purple", grad: "linear-gradient(135deg, #312e81, #581c87)" },
                        { name: "Minimalist Charcoal", grad: "linear-gradient(135deg, #27272a, #18181b)" },
                        { name: "Cyberpunk Neon", grad: "linear-gradient(135deg, #701a75, #1e1b4b)" },
                      ].map((item) => (
                        <button
                          key={item.name}
                          onClick={() => setTempGradient(item.grad)}
                          className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                            tempGradient === item.grad ? "border-text-primary scale-110 shadow-md" : "border-transparent hover:scale-105"
                          }`}
                          style={{ background: item.grad }}
                          title={item.name}
                        />
                      ))}
                    </div>
                  </div>
 
                </div>
              </div>
 
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsCoverModalOpen(false)}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCover}
                  className="px-5 py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Apply & Save
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: Animated Staged Checklist Loader overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-bg-primary rounded-[28px] border border-border-primary shadow-2xl p-6 sm:p-8 w-full max-w-[360px] mx-4 text-center animate-scaleUp text-text-primary">
            
            <div className="relative flex items-center justify-center mb-6">
              {/* Spinner background outline */}
              <div className="w-16 h-16 border-4 border-border-primary border-t-accent-primary rounded-full animate-spin"></div>
              <div className="absolute font-sans text-xs font-extrabold text-accent-primary">AI</div>
            </div>
 
            <h4 className="font-display font-medium text-base text-text-primary mb-1">
              {generationType === "outline" ? "Generating outline..." : "Co-writing draft..."}
            </h4>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-6">
              Powered by Gemini 2.5
            </p>
 
            {/* Checklist states list */}
            <div className="flex flex-col gap-2.5 text-left bg-bg-secondary p-4 rounded-xl border border-border-primary font-sans text-[11px] font-semibold text-text-secondary">
              {(generationType === "outline" ? outlineSteps : chapterSteps).map((stepText, idx) => {
                const isDone = generationStep > idx;
                const isCurrent = generationStep === idx;
 
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 transition-all duration-300 ${
                      isDone ? "opacity-50 text-text-muted line-through font-normal" : isCurrent ? "opacity-100 text-text-primary animate-pulse" : "opacity-30"
                    }`}
                  >
                    {isDone ? (
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    ) : isCurrent ? (
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-ring opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary"></span>
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-border-primary shrink-0"></span>
                    )}
                    <span className="truncate">{stepText}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      <ExportSettingsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exportConfig={book?.exportConfig}
        onSave={handleSaveExportConfig}
        onExport={handleExport}
      />

      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Unlock AI Writing ✨"
      >
        <div className="flex flex-col gap-4 text-left">
          <p className="text-text-secondary text-xs sm:text-sm font-medium leading-relaxed">
            Upgrade to <strong className="text-text-primary">Pro Plan</strong> to unlock powerful AI outline generation, AI chapter drafting, and the interactive writing assistant.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="flex-1 h-[46px] border border-border-primary hover:border-text-primary text-text-secondary hover:text-text-primary bg-bg-primary text-[10px] font-bold tracking-wider rounded-xl transition-all uppercase cursor-pointer"
            >
              Cancel
            </button>
            <Link
              to="/pricing"
              className="flex-1 h-[46px] bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-[10px] font-bold tracking-wider rounded-xl transition-all uppercase flex items-center justify-center cursor-pointer shadow-md shadow-[#8B5CF6]/10"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default EditorPage;
