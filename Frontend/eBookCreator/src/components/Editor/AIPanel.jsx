import React, { useState } from "react";
import Button from "../ui/Button";

const AIPanel = ({
  book,
  activeChapter,
  onGenerateChapterWithOptions,
  onEditChapterPrompt,
  onWholeBookCommand,
  onReviewChapter,
  onGenerateExercises,
  isGenerating,
  generationStatusText,
  isOpen,
  onClose,
  revisions = [],
  onRestoreRevision,
}) => {
  const [activeTab, setActiveTab] = useState("chapter"); // "chapter" | "book" | "history"
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [bookCommandInput, setBookCommandInput] = useState("");
  
  // Chapter generation control options
  const [difficulty, setDifficulty] = useState("Beginner");
  const [tone, setTone] = useState("Professional");
  const [contentType, setContentType] = useState("Practical Guide");
  const [length, setLength] = useState("Medium");
  const [includeOptions, setIncludeOptions] = useState({
    examples: true,
    exercises: true,
    mcqs: true,
    summary: true,
    faq: true,
    interviewQuestions: true,
  });

  const toggleInclude = (key) => {
    setIncludeOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sampleChapterPrompts = [
    "Make this chapter easier for beginners",
    "Add 3 practical real-world examples",
    "Add practice exercises at the end",
    "Fix all grammar mistakes and polish tone",
    "Convert this into a step-by-step tutorial",
    "Add interview questions with answers",
    "Make this explanation more concise",
  ];

  const sampleBookCommands = [
    "Make the entire book beginner friendly",
    "Add practical examples to every chapter",
    "Create comprehensive exercises for the whole book",
    "Create a professional book introduction",
    "Generate a complete book conclusion",
    "Create a comprehensive glossary of terms",
    "Generate a complete FAQ for the book",
  ];

  const handleCustomChapterEdit = (e) => {
    e.preventDefault();
    if (!naturalLanguageInput.trim() || isGenerating) return;
    onEditChapterPrompt(naturalLanguageInput.trim());
  };

  const handleBookCommandSubmit = (e) => {
    e.preventDefault();
    if (!bookCommandInput.trim() || isGenerating) return;
    onWholeBookCommand(bookCommandInput.trim());
  };

  if (!isOpen) return null;

  return (
    <aside className="w-96 border-l border-border-primary bg-bg-secondary flex flex-col h-full shrink-0 transition-all duration-300 select-none overflow-hidden">
      
      {/* Panel Header & Tabs */}
      <div className="p-3 border-b border-border-primary bg-bg-primary/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs font-bold shadow-xs">
            ✨
          </div>
          <h3 className="font-display font-bold text-sm text-text-primary">
            AI Book Assistant
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors text-xs"
          title="Close AI panel"
        >
          ✕
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border-primary bg-bg-secondary text-xs font-bold">
        <button
          onClick={() => setActiveTab("chapter")}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === "chapter"
              ? "border-brand-purple text-brand-purple bg-brand-purple/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Chapter AI
        </button>
        <button
          onClick={() => setActiveTab("book")}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === "book"
              ? "border-brand-purple text-brand-purple bg-brand-purple/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Whole Book
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-brand-purple text-brand-purple bg-brand-purple/5"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          History ({revisions.length})
        </button>
      </div>

      {/* Generating Progress Overlay */}
      {isGenerating && (
        <div className="p-4 bg-brand-purple/10 border-b border-brand-purple/30 animate-pulse flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-brand-purple block truncate">
              {generationStatusText || "Generating with AI..."}
            </span>
            <span className="text-[10px] text-text-muted">Gemini 3.6 Flash processing</span>
          </div>
        </div>
      )}

      {/* Tab 1: Chapter AI & Natural Language Edit */}
      {activeTab === "chapter" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          
          {/* Section A: Natural Language Chapter Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <span>Ask AI to edit this chapter...</span>
            </label>
            <form onSubmit={handleCustomChapterEdit} className="space-y-2">
              <div className="relative">
                <textarea
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="e.g., 'Rewrite the second section with 3 beginner-friendly code examples and add exercises'..."
                  rows={3}
                  className="w-full text-xs text-text-primary bg-bg-primary p-3 rounded-xl border border-border-primary focus:border-brand-purple focus:ring-1 focus:ring-brand-purple focus:outline-none resize-none placeholder:text-text-muted leading-relaxed"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={!naturalLanguageInput.trim() || isGenerating}
                className="w-full py-2.5 text-xs font-bold rounded-xl shadow-xs"
              >
                Apply AI Edit to Chapter ✨
              </Button>
            </form>

            {/* Quick Prompt Chips */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-text-muted block mb-1.5">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1">
                {sampleChapterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNaturalLanguageInput(prompt)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-bg-primary hover:bg-brand-purple/10 hover:text-brand-purple text-text-secondary border border-border-primary transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border-primary"></div>

          {/* Section B: Chapter Generation Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Chapter Generation Controls
              </span>
              <span className="text-[10px] font-mono text-brand-purple font-bold">
                {activeChapter?.title ? "Target: " + activeChapter.title.substring(0, 15) + "..." : "No Chapter"}
              </span>
            </div>

            {/* Difficulty & Tone Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs bg-bg-primary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs bg-bg-primary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none"
                >
                  <option value="Professional">Professional</option>
                  <option value="Academic">Academic</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Simple">Simple</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>
            </div>

            {/* Content Type & Length */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full text-xs bg-bg-primary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none"
                >
                  <option value="Tutorial">Tutorial</option>
                  <option value="Textbook">Textbook</option>
                  <option value="Reference">Reference</option>
                  <option value="Exam Prep">Exam Prep</option>
                  <option value="Practical Guide">Practical Guide</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full text-xs bg-bg-primary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none"
                >
                  <option value="Short (~800 w)">Short (~800 w)</option>
                  <option value="Medium (~1500 w)">Medium (~1500 w)</option>
                  <option value="Long (~2500 w)">Long (~2500 w)</option>
                </select>
              </div>
            </div>

            {/* Checklist of inclusions */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-2">Include in Chapter:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: "examples", label: "Examples & Cases" },
                  { key: "exercises", label: "Practice Exercises" },
                  { key: "mcqs", label: "Self-Test MCQs" },
                  { key: "summary", label: "Chapter Summary" },
                  { key: "faq", label: "Chapter FAQ" },
                  { key: "interviewQuestions", label: "Interview Questions" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer text-text-secondary">
                    <input
                      type="checkbox"
                      checked={includeOptions[item.key]}
                      onChange={() => toggleInclude(item.key)}
                      className="rounded accent-brand-purple"
                    />
                    <span className="text-[11px]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Full Chapter Button */}
            <button
              type="button"
              onClick={() =>
                onGenerateChapterWithOptions({
                  difficulty,
                  tone,
                  contentType,
                  length,
                  options: includeOptions,
                })
              }
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              🚀 Generate Full Chapter
            </button>
          </div>

          <div className="border-t border-border-primary"></div>

          {/* Section C: Quick Chapter AI Tools */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Quick AI Enhancements:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onEditChapterPrompt("Fix all grammar, spelling, and style errors")}
                className="p-2 text-xs bg-bg-primary hover:bg-bg-tertiary border border-border-primary rounded-lg text-text-primary text-left transition-colors"
              >
                ✓ Fix Grammar
              </button>
              <button
                type="button"
                onClick={() => onEditChapterPrompt("Simplify all complex concepts for beginners")}
                className="p-2 text-xs bg-bg-primary hover:bg-bg-tertiary border border-border-primary rounded-lg text-text-primary text-left transition-colors"
              >
                💡 Simplify Concepts
              </button>
              <button
                type="button"
                onClick={() => onGenerateExercises("exercises")}
                className="p-2 text-xs bg-bg-primary hover:bg-bg-tertiary border border-border-primary rounded-lg text-text-primary text-left transition-colors"
              >
                📝 Add Exercises & MCQs
              </button>
              <button
                type="button"
                onClick={() => onEditChapterPrompt("Add 3 in-depth practical case studies with examples")}
                className="p-2 text-xs bg-bg-primary hover:bg-bg-tertiary border border-border-primary rounded-lg text-text-primary text-left transition-colors"
              >
                🔍 Add Case Studies
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Whole Book Assistant */}
      {activeTab === "book" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Whole Book AI Commands
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Execute high-level AI operations across the entire book's structure and chapters.
            </p>

            <form onSubmit={handleBookCommandSubmit} className="space-y-2 pt-2">
              <textarea
                value={bookCommandInput}
                onChange={(e) => setBookCommandInput(e.target.value)}
                placeholder="e.g., 'Add practical examples to every chapter and generate a comprehensive glossary'..."
                rows={3}
                className="w-full text-xs text-text-primary bg-bg-primary p-3 rounded-xl border border-border-primary focus:border-brand-purple focus:ring-1 focus:ring-brand-purple focus:outline-none resize-none placeholder:text-text-muted leading-relaxed"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!bookCommandInput.trim() || isGenerating}
                className="w-full py-2.5 text-xs font-bold rounded-xl"
              >
                Execute Book Command ✨
              </Button>
            </form>
          </div>

          {/* Pre-packaged Whole Book Actions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Recommended Book Operations:
            </span>
            <div className="space-y-1.5">
              {sampleBookCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onWholeBookCommand(cmd)}
                  className="w-full p-2.5 text-xs bg-bg-primary hover:bg-brand-purple/5 hover:border-brand-purple/30 border border-border-primary rounded-xl text-text-primary text-left transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{cmd}</span>
                  <span className="text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Version History & Revisions */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Revision History
            </span>
            <span className="text-[10px] text-text-muted">Auto-saved on AI edits</span>
          </div>

          {revisions.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted bg-bg-primary rounded-xl border border-border-primary">
              No revisions recorded yet. AI edits will automatically create version checkpoints here.
            </div>
          ) : (
            revisions.map((rev, idx) => {
              const date = new Date(rev.timestamp);
              const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const formattedDate = date.toLocaleDateString();

              return (
                <div
                  key={rev._id || idx}
                  className="p-3 bg-bg-primary rounded-xl border border-border-primary space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">
                      {rev.operation || "AI Edit"}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {formattedDate} {formattedTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-secondary truncate">
                    Chapter: {rev.chapterTitle || "Current Chapter"}
                  </p>

                  <div className="flex items-center justify-end pt-2 border-t border-border-primary">
                    <button
                      type="button"
                      onClick={() => onRestoreRevision(rev)}
                      className="text-xs font-bold text-brand-purple hover:underline"
                    >
                      Restore this version ↩
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </aside>
  );
};

export default AIPanel;
