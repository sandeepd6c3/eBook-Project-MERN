import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import toast from "react-hot-toast";

// Modular Editor Components
import EditorSidebar from "../components/Editor/EditorSidebar";
import EditorToolbar from "../components/Editor/EditorToolbar";
import AIPanel from "../components/Editor/AIPanel";
import SelectionAIToolbar from "../components/Editor/SelectionAIToolbar";
import AIChangePreview from "../components/Editor/AIChangePreview";
import OutlineGeneratorModal from "../components/Editor/OutlineGeneratorModal";
import CoverBuilderModal from "../components/Editor/CoverBuilderModal";
import ExportSettingsModal from "../components/ui/ExportSettingsModal";

const API_BOOKS = "http://localhost:5000/api/books";
const API_AI = "http://localhost:5000/api/ai";

const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get("bookId");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Book states
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(-1);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterBody, setChapterBody] = useState("");
  const [bookTitle, setBookTitle] = useState("");

  // Editor states & Selection
  const editorRef = useRef(null);
  const isTypingRef = useRef(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // AI states & Change preview
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatusText, setGenerationStatusText] = useState("");
  const [aiPreviewData, setAiPreviewData] = useState(null); // { original, suggested, instruction, target: "chapter" | "selection", range }
  const [revisions, setRevisions] = useState([]);

  // Modals
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAiCoverGenerating, setIsAiCoverGenerating] = useState(false);

  // Export dropdown
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Fetch book details and revisions on mount
  useEffect(() => {
    if (!bookId) {
      toast.error("No eBook selected.");
      navigate("/dashboard");
      return;
    }
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to load book");
      const data = await response.json();
      setBook(data);
      setBookTitle(data.title || "Untitled Book");

      if (data.chapters && data.chapters.length > 0) {
        setActiveChapterIndex(0);
        setChapterTitle(data.chapters[0].title);
        setChapterBody(data.chapters[0].body || "");
      } else {
        setActiveChapterIndex(-1);
      }

      // Fetch revisions
      fetchRevisions();
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch book details.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisions = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BOOKS}/${bookId}/revisions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const revs = await res.json();
        setRevisions(revs || []);
      }
    } catch (err) {
      console.error("Fetch revisions error:", err);
    }
  };

  // Sync editor content whenever chapterBody changes from external updates
  useEffect(() => {
    if (editorRef.current && !isTypingRef.current) {
      if (editorRef.current.innerHTML !== chapterBody) {
        editorRef.current.innerHTML = chapterBody;
      }
    }
  }, [chapterBody]);

  // Handle Text Selection in the Editor
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (
        selection &&
        selection.toString().trim().length > 0 &&
        editorRef.current &&
        editorRef.current.contains(selection.anchorNode)
      ) {
        const text = selection.toString().trim();
        setSelectedText(text);

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
        });
      } else {
        setSelectedText("");
        setSelectionPosition(null);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  // Autosave Timer
  useEffect(() => {
    if (!isDirty || activeChapterIndex === -1 || !book) return;

    const timer = setTimeout(() => {
      saveChapterSilent(activeChapterIndex, chapterTitle, chapterBody);
    }, 1500);

    return () => clearTimeout(timer);
  }, [chapterBody, chapterTitle, bookTitle, isDirty]);

  // Silent Save to MongoDB
  const saveChapterSilent = async (idx, titleToSave, bodyToSave) => {
    if (!book || idx < 0 || idx >= book.chapters.length) return;
    setSaving(true);
    const token = localStorage.getItem("token");

    const updatedChapters = [...book.chapters];
    const words = bodyToSave ? bodyToSave.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length : 0;

    updatedChapters[idx] = {
      ...updatedChapters[idx],
      title: titleToSave,
      body: bodyToSave,
      wordCount: words,
      status: words > 50 ? "Edited" : "Draft",
      updatedAt: new Date(),
    };

    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle,
          chapters: updatedChapters,
        }),
      });

      if (!response.ok) throw new Error("Autosave failed");
      const updated = await response.json();
      setBook(updated);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Autosave error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Add a Revision entry to backend
  const recordRevision = async (operation, prevContent, newContent) => {
    if (!book || activeChapterIndex === -1) return;
    const token = localStorage.getItem("token");
    const activeCh = book.chapters[activeChapterIndex];

    try {
      const res = await fetch(`${API_BOOKS}/${bookId}/revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterId: activeCh._id || bookId,
          chapterTitle: activeCh.title,
          previousContent: prevContent,
          newContent: newContent,
          operation,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRevisions(data.revisions || []);
      }
    } catch (err) {
      console.error("Record revision error:", err);
    }
  };

  // Select Chapter
  const selectChapter = async (idx) => {
    if (isDirty && activeChapterIndex !== -1) {
      await saveChapterSilent(activeChapterIndex, chapterTitle, chapterBody);
    }
    setActiveChapterIndex(idx);
    setChapterTitle(book.chapters[idx].title);
    setChapterBody(book.chapters[idx].body || "");
    isTypingRef.current = false;
    if (editorRef.current) {
      editorRef.current.innerHTML = book.chapters[idx].body || "";
    }
    setAiPreviewData(null);
  };

  // Add Chapter
  const handleAddChapter = async () => {
    if (!book) return;
    const token = localStorage.getItem("token");
    const nextNum = book.chapters.length + 1;
    const newCh = {
      title: `Chapter ${nextNum}: Untitled Chapter`,
      body: "",
      status: "Draft",
      wordCount: 0,
      order: book.chapters.length,
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
      toast.success("New chapter created");
    } catch (err) {
      console.error(err);
      toast.error("Could not add chapter.");
    }
  };

  // Rename Chapter
  const handleRenameChapter = (idx, newName) => {
    if (!book) return;
    const updated = [...book.chapters];
    updated[idx].title = newName;
    setBook({ ...book, chapters: updated });
    if (activeChapterIndex === idx) {
      setChapterTitle(newName);
    }
    setIsDirty(true);
  };

  // Delete Chapter
  const handleDeleteChapter = async (idx) => {
    if (!book || book.chapters.length <= 1) {
      toast.error("A book must have at least one chapter.");
      return;
    }
    const token = localStorage.getItem("token");
    const updatedChapters = book.chapters.filter((_, i) => i !== idx);

    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chapters: updatedChapters }),
      });

      if (!response.ok) throw new Error("Failed to delete chapter");
      const data = await response.json();
      setBook(data);
      const nextIdx = Math.max(0, idx - 1);
      await selectChapter(nextIdx);
      toast.success("Chapter removed");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete chapter.");
    }
  };

  // Reorder Chapters
  const handleReorderChapters = async (fromIdx, toIdx) => {
    if (!book) return;
    const chaptersCopy = [...book.chapters];
    const [moved] = chaptersCopy.splice(fromIdx, 1);
    chaptersCopy.splice(toIdx, 0, moved);

    setBook({ ...book, chapters: chaptersCopy });
    setActiveChapterIndex(toIdx);
    setIsDirty(true);
  };

  // Rich-Text Formatting
  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setChapterBody(html);
      setIsDirty(true);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter link URL (e.g. https://...):");
    if (url) handleFormat("createLink", url);
  };

  const handleInsertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) handleFormat("insertImage", url);
  };

  const handleInsertDivider = () => {
    handleFormat("insertHorizontalRule");
  };

  const handleEditorInput = (e) => {
    isTypingRef.current = true;
    const html = e.currentTarget.innerHTML;
    setChapterBody(html);
    setIsDirty(true);
  };

  // AI Outline Generation
  const handleGenerateOutline = async (params) => {
    setIsOutlineModalOpen(false);
    setIsGenerating(true);
    setGenerationStatusText("Generating structured chapters with Gemini 3.6 Flash...");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/generate-book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Failed to generate book plan");
      const data = await response.json();

      setBookTitle(data.title || book.title);

      const mappedChapters = (data.chapters || []).map((ch, idx) => ({
        title: ch.title,
        body: "",
        status: "Draft",
        wordCount: 0,
        order: idx,
      }));

      // Update Database
      const saveRes = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title || book.title,
          subtitle: data.subtitle || "",
          description: data.description || book.description,
          chapters: mappedChapters,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save generated book plan");
      const updatedBook = await saveRes.json();
      setBook(updatedBook);
      toast.success("eBook plan generated successfully! ✨");

      if (updatedBook.chapters.length > 0) {
        await selectChapter(0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate outline with AI.");
    } finally {
      setIsGenerating(false);
      setGenerationStatusText("");
    }
  };

  // AI Chapter Drafting with options
  const handleGenerateChapterWithOptions = async (optionsPayload) => {
    if (activeChapterIndex === -1 || !book) return;
    const activeCh = book.chapters[activeChapterIndex];

    setIsGenerating(true);
    setGenerationStatusText(`Drafting "${activeCh.title}" with Gemini 3.6 Flash...`);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/generate-chapter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle,
          chapterTitle: activeCh.title,
          chapterSummary: activeCh.summary || "",
          writingStyle: optionsPayload.tone,
          difficulty: optionsPayload.difficulty,
          contentType: optionsPayload.contentType,
          length: optionsPayload.length,
          options: optionsPayload.options,
        }),
      });

      if (!response.ok) throw new Error("AI chapter drafting failed");
      const data = await response.json();

      setAiPreviewData({
        original: chapterBody,
        suggested: data.content,
        instruction: `Generate chapter (${optionsPayload.difficulty}, ${optionsPayload.contentType})`,
        target: "chapter",
      });

      toast.success("AI draft prepared! Review the suggested changes below.");
    } catch (err) {
      console.error(err);
      toast.error("AI chapter generation failed.");
    } finally {
      setIsGenerating(false);
      setGenerationStatusText("");
    }
  };

  // Natural Language Chapter Edit
  const handleEditChapterPrompt = async (instruction) => {
    if (activeChapterIndex === -1 || !book) return;
    const activeCh = book.chapters[activeChapterIndex];

    setIsGenerating(true);
    setGenerationStatusText(`Applying AI edit: "${instruction}"...`);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/edit-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: chapterBody || "<p>Start writing...</p>",
          instruction,
          chapterTitle: activeCh.title,
          bookTitle: bookTitle,
        }),
      });

      if (!response.ok) throw new Error("AI editing failed");
      const data = await response.json();

      setAiPreviewData({
        original: chapterBody,
        suggested: data.suggested,
        instruction,
        target: "chapter",
      });

      toast.success("AI suggested edit ready for review!");
    } catch (err) {
      console.error(err);
      toast.error("AI Edit failed.");
    } finally {
      setIsGenerating(false);
      setGenerationStatusText("");
    }
  };

  // Selection AI Action
  const handleSelectionAction = async (action) => {
    if (!selectedText) return;
    setIsGenerating(true);
    setGenerationStatusText(`Processing selection (${action})...`);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/edit-selection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedText,
          action,
        }),
      });

      if (!response.ok) throw new Error("Selection AI edit failed");
      const data = await response.json();

      setAiPreviewData({
        original: selectedText,
        suggested: data.suggested,
        instruction: `Selection: ${action}`,
        target: "selection",
      });

      toast.success("Selection AI suggestion ready!");
    } catch (err) {
      console.error(err);
      toast.error("Selection AI action failed.");
    } finally {
      setIsGenerating(false);
      setGenerationStatusText("");
    }
  };

  // Selection Custom Prompt Ask
  const handleSelectionCustomAsk = async (customInstruction) => {
    if (!selectedText) return;
    setIsGenerating(true);
    setGenerationStatusText(`Processing: "${customInstruction}"...`);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/edit-selection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedText,
          action: "custom",
          customInstruction,
        }),
      });

      if (!response.ok) throw new Error("Custom selection AI failed");
      const data = await response.json();

      setAiPreviewData({
        original: selectedText,
        suggested: data.suggested,
        instruction: customInstruction,
        target: "selection",
      });

      toast.success("AI suggestion ready!");
    } catch (err) {
      console.error(err);
      toast.error("Custom selection AI failed.");
    } finally {
      setIsGenerating(false);
      setGenerationStatusText("");
    }
  };

  // Whole Book AI Command
  const handleWholeBookCommand = async (command) => {
    if (!book) return;
    setIsGenerating(true);
    setGenerationStatusText(`Executing book assistant: "${command}"...`);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/review-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId,
          command,
          chapters: book.chapters,
          bookTitle: bookTitle,
          bookDescription: book.description,
        }),
      });

      if (!response.ok) throw new Error("Book assistant failed");
      const data = await response.json();

      setAiPreviewData({
        original: chapterBody,
        suggested: data.response,
        instruction: `Whole Book: ${command}`,
        target: "chapter",
      });

      toast.success("Whole book assistant completed! Review output below.");
    } catch (err) {
      console.error(err);
      toast.error("Whole book assistant failed.");
    } finally {
      setIsGenerating(false);
      setGenerationStatusText("");
    }
  };

  // Generate Exercises for current chapter
  const handleGenerateExercises = async (type) => {
    if (activeChapterIndex === -1 || !book) return;
    const activeCh = book.chapters[activeChapterIndex];

    setIsGenerating(true);
    setGenerationStatusText(`Generating exercises & MCQs for "${activeCh.title}"...`);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/generate-exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterTitle: activeCh.title,
          chapterContent: chapterBody,
          type,
        }),
      });

      if (!response.ok) throw new Error("Generate exercises failed");
      const data = await response.json();

      const combined = `${chapterBody}\n<hr/>\n${data.content}`;

      setAiPreviewData({
        original: chapterBody,
        suggested: combined,
        instruction: "Add Exercises, MCQs & Challenges",
        target: "chapter",
      });

      toast.success("Exercises and MCQs generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate exercises.");
    } finally {
      setIsGenerating(false);
      setGenerationStatusText("");
    }
  };

  // Accept AI Preview Changes
  const handleAcceptAIChanges = async () => {
    if (!aiPreviewData) return;
    const previous = chapterBody;
    let nextContent = "";

    if (aiPreviewData.target === "selection") {
      nextContent = chapterBody.replace(aiPreviewData.original, aiPreviewData.suggested);
    } else {
      nextContent = aiPreviewData.suggested;
    }

    setChapterBody(nextContent);
    isTypingRef.current = false;
    if (editorRef.current) {
      editorRef.current.innerHTML = nextContent;
    }

    // Record Revision
    await recordRevision(aiPreviewData.instruction || "AI Edit", previous, nextContent);

    // Save
    await saveChapterSilent(activeChapterIndex, chapterTitle, nextContent);

    setAiPreviewData(null);
    toast.success("AI changes applied and saved to version history! ✓");
  };

  // Reject AI Changes
  const handleRejectAIChanges = () => {
    setAiPreviewData(null);
    toast("AI changes discarded.", { icon: "↩️" });
  };

  // Restore Revision from History
  const handleRestoreRevision = async (rev) => {
    if (!confirm(`Restore version from ${new Date(rev.timestamp).toLocaleTimeString()}?`)) return;

    const previous = chapterBody;
    setChapterBody(rev.newContent || rev.previousContent);
    isTypingRef.current = false;
    if (editorRef.current) {
      editorRef.current.innerHTML = rev.newContent || rev.previousContent;
    }

    await recordRevision(`Restored: ${rev.operation}`, previous, rev.newContent || rev.previousContent);
    await saveChapterSilent(activeChapterIndex, chapterTitle, rev.newContent || rev.previousContent);
    toast.success("Version restored successfully!");
  };

  // AI Cover Generation (Pollinations)
  const handleGenerateAICover = async (prompt) => {
    setIsAiCoverGenerating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_AI}/generate-cover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("AI Cover generation failed");
      const data = await response.json();
      toast.success("AI Cover generated!");
      return data.imageUrl;
    } catch (err) {
      console.error(err);
      toast.error("Cover generation failed.");
      return null;
    } finally {
      setIsAiCoverGenerating(false);
    }
  };

  // Save Cover Settings
  const handleSaveCover = async (coverConfig) => {
    const token = localStorage.getItem("token");
    const updatedSettings = {
      ...(book.settings || {}),
      coverConfig,
    };

    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coverImage: coverConfig.imageUrl || "",
          settings: updatedSettings,
        }),
      });

      if (!response.ok) throw new Error("Failed to save cover");
      const data = await response.json();
      setBook(data);
      toast.success("Cover settings updated!");
    } catch (err) {
      console.error(err);
      toast.error("Could not save cover settings.");
    }
  };

  // Save Export Settings & Trigger Export
  const handleSaveExportSettings = async (exportConfig) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BOOKS}/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ exportConfig }),
      });
      if (response.ok) {
        const data = await response.json();
        setBook(data);
        toast.success("Export layout saved!");
      }
    } catch (err) {
      console.error("Export save error:", err);
    }
  };

  const handleExportDocument = (format, customConfig = null) => {
    const config = customConfig || book?.exportConfig || {};
    const coverConfig = book?.settings?.coverConfig || {};

    if (format === "pdf" || format === "html") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to export documents.");
        return;
      }

      let fullHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${bookTitle}</title>
      <style>
        @page {
          size: ${config.pageSize === "a4" ? "A4" : "letter"};
          margin: 1in;
        }
        body {
          font-family: ${config.fontFamily || "Lora"}, Georgia, serif;
          font-size: ${config.fontSize || 16}px;
          line-height: ${config.lineHeight || 1.6};
          color: #1a1a1a;
          margin: 0;
          padding: 0;
        }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        h1 { font-size: 28px; margin-bottom: 0.5em; }
        h2 { font-size: 22px; margin-top: 1.5em; margin-bottom: 0.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
        h3 { font-size: 18px; margin-top: 1.2em; }
        p { margin-bottom: 1em; text-align: ${config.textAlignment === "justify" ? "justify" : "left"}; }
        blockquote { border-left: 3px solid #7c3aed; padding-left: 1em; font-style: italic; color: #475569; }
        pre { background: #f8fafc; padding: 1em; border-radius: 6px; font-family: monospace; font-size: 13px; border: 1px solid #e2e8f0; }
        .page-break { page-break-before: always; }
        .print-cover { height: 100vh; display: flex; flex-col; justify-content: space-between; page-break-after: always; text-align: center; padding: 2in 0; }
        .print-cover h1 { font-size: 36px; color: #7c3aed; }
      </style></head><body>`;

      if (config.includeCover) {
        fullHTML += `<div class="print-cover">
          <div>
            <p style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.2em; color: #64748b;">${coverConfig.subtitle || "DIGITAL PUBLICATION"}</p>
            <h1>${bookTitle}</h1>
          </div>
          <div><p style="font-style: italic;">by ${user?.username || "Author"}</p></div>
          <p style="font-size: 10px; color: #94a3b8;">Published with eBookAI Platform</p>
        </div>`;
      }

      if (config.includeTOC && book.chapters.length > 0) {
        fullHTML += `<div class="page-break" style="padding-top: 1in;">
          <h2 style="text-align: center; margin-bottom: 1.5em;">Table of Contents</h2>
          ${book.chapters.map((ch, idx) => `<div style="display: flex; justify-content: space-between; margin-bottom: 0.8em; font-size: 14px;"><span>Chapter ${idx + 1}: ${ch.title}</span><span style="font-family: monospace;">Page ${idx + 2}</span></div>`).join("")}
        </div>`;
      }

      book.chapters.forEach((ch, idx) => {
        fullHTML += `<div class="page-break">
          <h2>Chapter ${idx + 1}: ${ch.title}</h2>
          <div>${ch.body || "<p><em>No content</em></p>"}</div>
        </div>`;
      });

      fullHTML += `</body></html>`;
      printWindow.document.write(fullHTML);
      printWindow.document.close();

      if (format === "pdf") {
        printWindow.print();
      }
      toast.success(format === "pdf" ? "PDF Print dialog opened!" : "HTML Document exported!");
    } else if (format === "docx") {
      const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset="utf-8"><title>${bookTitle}</title></head><body><h1>${bookTitle}</h1>${book.chapters.map(ch => `<h2>${ch.title}</h2><div>${ch.body}</div>`).join("")}</body></html>`;
      const blob = new Blob([docHtml], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bookTitle.replace(/\s+/g, "_")}.doc`;
      link.click();
      toast.success("DOCX exported!");
    } else if (format === "epub") {
      const docHtml = `<html><head><meta charset="utf-8"><title>${bookTitle}</title></head><body><h1>${bookTitle}</h1>${book.chapters.map(ch => `<h3>${ch.title}</h3><div>${ch.body}</div>`).join("<hr/>")}</body></html>`;
      const blob = new Blob([docHtml], { type: "application/epub+zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bookTitle.replace(/\s+/g, "_")}.epub`;
      link.click();
      toast.success("EPUB exported!");
    }
  };

  // Word & Character count calculation
  const cleanBody = chapterBody ? chapterBody.replace(/<[^>]*>/g, " ").trim() : "";
  const wordCount = cleanBody ? cleanBody.split(/\s+/).filter(Boolean).length : 0;
  const charCount = cleanBody ? cleanBody.length : 0;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Loading eBook Studio...
          </span>
        </div>
      </div>
    );
  }

  const activeChapter = activeChapterIndex >= 0 && book?.chapters ? book.chapters[activeChapterIndex] : null;

  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col font-sans select-text overflow-hidden transition-colors duration-250">
      
      {/* Editor CSS Formatting styles injection */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

        .editor-paper [contenteditable]:empty:before {
          content: attr(placeholder);
          color: var(--text-muted);
          pointer-events: none;
          display: block;
        }
        .editor-paper blockquote {
          border-left: 3px solid var(--accent-primary);
          padding-left: 1rem;
          margin: 1.25rem 0;
          font-style: italic;
          color: var(--text-secondary);
        }
        .editor-paper pre {
          background-color: var(--bg-tertiary);
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          overflow-x: auto;
          font-size: 0.85rem;
          margin: 1.25rem 0;
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
        }
        .editor-paper ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .editor-paper ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .editor-paper h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
        }
        .editor-paper h2 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
        }
        .editor-paper h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
        }
        .editor-paper p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .editor-paper a {
          color: var(--accent-primary);
          text-decoration: underline;
        }
      `}</style>

      {/* 1. TOP HEADER BAR */}
      <header className="h-16 bg-bg-secondary border-b border-border-primary px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 shrink-0">
        
        {/* Left Side: Back & Toggle & Book Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors text-xs font-bold shrink-0 flex items-center gap-1.5"
            title="Back to dashboard"
          >
            <span>←</span>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="p-2 rounded-xl hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors text-xs font-bold shrink-0"
            title="Toggle Chapters Sidebar"
          >
            📑
          </button>

          <div className="h-5 w-[1px] bg-border-primary shrink-0"></div>

          {/* Editable Book Title */}
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => {
              setBookTitle(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Untitled Book"
            className="text-xs sm:text-sm font-bold text-text-primary bg-transparent border-b border-transparent hover:border-border-primary focus:border-brand-purple focus:outline-none px-1.5 py-1 rounded truncate max-w-xs sm:max-w-md"
          />
        </div>

        {/* Right Side: Autosave, Export, Theme, AI Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Autosave Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
            {saving ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Saving...</span>
              </>
            ) : isDirty ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Unsaved changes</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Saved ✓</span>
              </>
            )}
          </div>

          <ThemeSwitcher className="hidden sm:flex" />

          {/* Export Settings & Instant Download Button */}
          <div className="relative">
            <div className="inline-flex rounded-xl shadow-xs">
              <Button
                variant="secondary"
                onClick={() => handleExportDocument("pdf")}
                className="px-3 py-2 text-xs font-bold rounded-l-xl rounded-r-none border-r-0"
                title="Quick Export to PDF"
              >
                Export PDF
              </Button>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary rounded-r-xl text-text-secondary hover:text-text-primary text-xs font-bold transition-colors"
                title="More Export Formats & Layout Builder"
              >
                ▼
              </button>
            </div>

            {/* Export Dropdown Menu */}
            {exportDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-bg-primary rounded-2xl shadow-xl border border-border-primary py-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setExportDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-primary mb-1">
                  Export Formats
                </div>
                <button
                  onClick={() => {
                    handleExportDocument("pdf");
                    setExportDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-text-primary hover:bg-bg-secondary flex items-center justify-between"
                >
                  <span>PDF Document</span>
                  <span className="text-[10px] font-mono text-text-muted">.pdf</span>
                </button>
                <button
                  onClick={() => {
                    handleExportDocument("docx");
                    setExportDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-text-primary hover:bg-bg-secondary flex items-center justify-between"
                >
                  <span>Microsoft Word</span>
                  <span className="text-[10px] font-mono text-text-muted">.docx</span>
                </button>
                <button
                  onClick={() => {
                    handleExportDocument("epub");
                    setExportDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-text-primary hover:bg-bg-secondary flex items-center justify-between"
                >
                  <span>EPUB (e-Readers)</span>
                  <span className="text-[10px] font-mono text-text-muted">.epub</span>
                </button>
                <div className="border-t border-border-primary my-1"></div>
                <button
                  onClick={() => {
                    setIsExportModalOpen(true);
                    setExportDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-bold text-brand-purple hover:bg-brand-purple/10 flex items-center gap-1.5"
                >
                  <span>⚙️ Layout Builder...</span>
                </button>
              </div>
            )}
          </div>

          {/* Right AI Panel Toggle */}
          <Button
            variant="primary"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="px-3 py-2 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <span>✨</span>
            <span className="hidden sm:inline">AI Panel</span>
          </Button>

        </div>

      </header>

      {/* 2. THREE-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR: Chapters & Book Cover */}
        <EditorSidebar
          book={book}
          activeChapterIndex={activeChapterIndex}
          onSelectChapter={selectChapter}
          onAddChapter={handleAddChapter}
          onRenameChapter={handleRenameChapter}
          onDeleteChapter={handleDeleteChapter}
          onReorderChapters={handleReorderChapters}
          onOpenCoverModal={() => setIsCoverModalOpen(true)}
          onOpenOutlineModal={() => setIsOutlineModalOpen(true)}
          isOpen={leftSidebarOpen}
          onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        />

        {/* CENTER COLUMN: Professional Canvas & Rich Editor */}
        <main className="flex-1 flex flex-col bg-bg-tertiary/40 overflow-hidden relative">
          
          {/* Rich Text Toolbar */}
          <EditorToolbar
            onFormat={handleFormat}
            onInsertLink={handleInsertLink}
            onInsertImage={handleInsertImage}
            onInsertDivider={handleInsertDivider}
            onUndo={() => handleFormat("undo")}
            onRedo={() => handleFormat("redo")}
          />

          {/* Scrollable Document Canvas Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 flex flex-col items-center">
            
            <div className="w-full max-w-3xl flex flex-col">
              
              {/* AI Change Preview Diff Card */}
              {aiPreviewData && (
                <AIChangePreview
                  original={aiPreviewData.original}
                  suggested={aiPreviewData.suggested}
                  instruction={aiPreviewData.instruction}
                  onAccept={handleAcceptAIChanges}
                  onReject={handleRejectAIChanges}
                  onTryAgain={() => handleEditChapterPrompt(aiPreviewData.instruction)}
                />
              )}

              {/* Main Document Paper (Google Docs / Notion style sheet) */}
              <div className="bg-bg-primary rounded-2xl shadow-lg border border-border-primary p-6 sm:p-12 min-h-[850px] flex flex-col relative transition-colors duration-250">
                
                {/* Chapter Title Input */}
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => {
                    setChapterTitle(e.target.value);
                    if (activeChapterIndex !== -1) {
                      const updated = [...book.chapters];
                      updated[activeChapterIndex].title = e.target.value;
                      setBook({ ...book, chapters: updated });
                    }
                    setIsDirty(true);
                  }}
                  placeholder="Chapter Title..."
                  className="font-display font-bold text-2xl sm:text-3xl text-text-primary bg-transparent border-none focus:outline-none mb-6 pb-2 border-b border-border-primary/50 placeholder:text-text-muted/60"
                />

                {/* Contenteditable Rich Canvas */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  placeholder="Start writing or tell AI to draft this chapter..."
                  className="editor-paper flex-1 text-sm sm:text-base text-text-primary focus:outline-none leading-relaxed"
                />

              </div>

              {/* Canvas Footer: Word Count & Chapter Meta */}
              <div className="flex items-center justify-between text-xs text-text-muted py-4 px-2">
                <div className="flex items-center gap-3">
                  <span>{wordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{charCount.toLocaleString()} characters</span>
                  <span>•</span>
                  <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
                </div>
                <div className="text-[11px] font-mono">
                  Chapter {activeChapterIndex + 1} of {book?.chapters?.length || 0}
                </div>
              </div>

            </div>

          </div>

          {/* Floating AI Selection Toolbar */}
          <SelectionAIToolbar
            selectedText={selectedText}
            position={selectionPosition}
            onApplyAction={handleSelectionAction}
            onCustomAsk={handleSelectionCustomAsk}
            onClose={() => {
              setSelectedText("");
              setSelectionPosition(null);
            }}
          />

        </main>

        {/* RIGHT SIDEBAR: AI Writing Assistant Panel */}
        <AIPanel
          book={book}
          activeChapter={activeChapter}
          onGenerateChapterWithOptions={handleGenerateChapterWithOptions}
          onEditChapterPrompt={handleEditChapterPrompt}
          onWholeBookCommand={handleWholeBookCommand}
          onReviewChapter={handleEditChapterPrompt}
          onGenerateExercises={handleGenerateExercises}
          isGenerating={isGenerating}
          generationStatusText={generationStatusText}
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
          revisions={revisions}
          onRestoreRevision={handleRestoreRevision}
        />

      </div>

      {/* 3. MODALS */}
      <OutlineGeneratorModal
        isOpen={isOutlineModalOpen}
        onClose={() => setIsOutlineModalOpen(false)}
        initialTopic={bookTitle}
        onGenerate={handleGenerateOutline}
        isGenerating={isGenerating}
      />

      <CoverBuilderModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        initialConfig={book?.settings?.coverConfig}
        bookTitle={bookTitle}
        authorName={user?.username || "Author"}
        onSaveCover={handleSaveCover}
        onGenerateAICover={handleGenerateAICover}
        isGeneratingAI={isAiCoverGenerating}
      />

      <ExportSettingsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exportConfig={book?.exportConfig}
        onSave={handleSaveExportSettings}
        onExport={handleExportDocument}
      />

    </div>
  );
};

export default EditorPage;
