import React from "react";
import BookCover from "./BookCover";

const EditorSidebar = ({
  book,
  activeChapterIndex,
  onSelectChapter,
  onAddChapter,
  onRenameChapter,
  onDeleteChapter,
  onReorderChapters,
  onOpenCoverModal,
  onOpenOutlineModal,
  isOpen,
  onToggle,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState(null);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editTitle, setEditTitle] = React.useState("");

  const handleStartRename = (idx, currentTitle, e) => {
    e.stopPropagation();
    setEditingIndex(idx);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (idx, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChapter(idx, editTitle.trim());
    }
    setEditingIndex(null);
  };

  const handleKeyDownRename = (idx, e) => {
    if (e.key === "Enter") {
      handleSaveRename(idx, e);
    } else if (e.key === "Escape") {
      setEditingIndex(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (idx) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    onReorderChapters(draggedIndex, targetIdx);
    setDraggedIndex(null);
  };

  if (!isOpen) return null;

  const totalWords = (book?.chapters || []).reduce((acc, ch) => {
    const text = ch.body ? ch.body.replace(/<[^>]*>/g, " ").trim() : "";
    const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
    return acc + count;
  }, 0);

  return (
    <aside className="w-80 border-r border-border-primary bg-bg-secondary flex flex-col h-full shrink-0 transition-all duration-300 select-none overflow-hidden">
      
      {/* Book Summary Card */}
      <div className="p-4 border-b border-border-primary bg-bg-primary/50">
        <div className="flex items-start gap-3">
          {/* Miniature 3D Book Cover */}
          <div 
            onClick={onOpenCoverModal}
            className="w-16 h-22 shrink-0 cursor-pointer group relative rounded shadow-sm hover:scale-105 transition-transform"
            title="Click to edit book cover"
          >
            <BookCover 
              config={book?.settings?.coverConfig || { style: "modern", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}
              title={book?.title || "eBook"}
              author={book?.author?.username || "Author"}
              className="w-full h-full text-[6px]"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center text-[9px] text-white font-bold transition-opacity">
              Edit
            </div>
          </div>

          {/* Book Info */}
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm text-text-primary truncate" title={book?.title}>
              {book?.title || "Untitled Book"}
            </h3>
            {book?.subtitle && (
              <p className="text-[11px] text-text-muted truncate mt-0.5" title={book?.subtitle}>
                {book.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-secondary border border-border-primary text-text-secondary font-medium">
                {book?.chapters?.length || 0} Chapters
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {totalWords.toLocaleString()} words
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Header & Actions */}
      <div className="px-4 py-3 border-b border-border-primary flex items-center justify-between bg-bg-secondary">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary">
            Table of Contents
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenOutlineModal}
            className="text-[10px] font-bold text-brand-purple hover:bg-brand-purple/10 px-2 py-1 rounded transition-colors"
            title="Generate structured outline with AI"
          >
            AI Outline ✨
          </button>
          <button
            onClick={onAddChapter}
            className="p-1 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
            title="Add new chapter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chapters Drag-and-Drop List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {(!book?.chapters || book.chapters.length === 0) ? (
          <div className="p-6 text-center">
            <p className="text-xs text-text-muted mb-3">No chapters created yet.</p>
            <button
              onClick={onOpenOutlineModal}
              className="text-xs font-bold text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20 px-3 py-2 rounded-lg transition-colors w-full"
            >
              Generate Outline with AI ✨
            </button>
          </div>
        ) : (
          book.chapters.map((ch, idx) => {
            const isSelected = activeChapterIndex === idx;
            const text = ch.body ? ch.body.replace(/<[^>]*>/g, " ").trim() : "";
            const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
            const status = ch.status || (words > 50 ? "Edited" : "Draft");

            return (
              <div
                key={ch._id || idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
                onClick={() => onSelectChapter(idx)}
                className={`group relative rounded-xl p-3 cursor-pointer border transition-all ${
                  isSelected
                    ? "bg-bg-primary border-brand-purple shadow-sm ring-1 ring-brand-purple/30"
                    : "bg-transparent border-transparent hover:bg-bg-primary hover:border-border-primary"
                } ${draggedIndex === idx ? "opacity-40" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Drag Grip + Chapter Number */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="cursor-grab text-text-muted/40 group-hover:text-text-muted text-xs">
                      ⋮⋮
                    </span>
                    <span className="text-[10px] font-mono text-text-muted font-bold shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Editable Chapter Title */}
                    {editingIndex === idx ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={(e) => handleSaveRename(idx, e)}
                        onKeyDown={(e) => handleKeyDownRename(idx, e)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-text-primary bg-bg-secondary px-1.5 py-0.5 rounded border border-brand-purple focus:outline-none w-full"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-text-primary truncate block flex-1">
                        {ch.title}
                      </span>
                    )}
                  </div>

                  {/* Actions (Rename / Delete) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => handleStartRename(idx, ch.title, e)}
                      className="p-1 hover:bg-bg-tertiary rounded text-text-muted hover:text-text-primary text-[10px]"
                      title="Rename"
                    >
                      ✏️
                    </button>
                    {book.chapters.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${ch.title}"?`)) {
                            onDeleteChapter(idx);
                          }
                        }}
                        className="p-1 hover:bg-rose-500/10 rounded text-text-muted hover:text-rose-500 text-[10px]"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-info: Word count & Status badge */}
                <div className="flex items-center justify-between mt-2 pl-6 text-[10px]">
                  <span className="text-text-muted font-mono">{words} words</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${
                      status === "Generated"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : status === "Edited"
                        ? "bg-brand-blue/10 text-brand-blue"
                        : "bg-text-muted/10 text-text-muted"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Add Chapter Button */}
      <div className="p-3 border-t border-border-primary bg-bg-primary/40">
        <button
          onClick={onAddChapter}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-border-primary hover:border-brand-purple hover:bg-brand-purple/5 text-xs font-bold text-text-secondary hover:text-brand-purple transition-all"
        >
          <span>+</span>
          <span>Add Chapter</span>
        </button>
      </div>

    </aside>
  );
};

export default EditorSidebar;
