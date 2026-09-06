import React, { useState } from "react";

const SelectionAIToolbar = ({
  selectedText,
  position,
  onApplyAction,
  onCustomAsk,
  onClose,
}) => {
  const [showAskInput, setShowAskInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);

  if (!selectedText || !position) return null;

  const quickActions = [
    { id: "rewrite", label: "Rewrite", icon: "✨" },
    { id: "expand", label: "Expand", icon: "➕" },
    { id: "shorten", label: "Shorten", icon: "✂️" },
    { id: "simplify", label: "Simplify", icon: "💡" },
    { id: "grammar", label: "Fix Grammar", icon: "✓" },
    { id: "professional", label: "Professional", icon: "👔" },
    { id: "academic", label: "Academic", icon: "🎓" },
    { id: "creative", label: "Creative", icon: "🎨" },
    { id: "add-example", label: "Add Example", icon: "🔍" },
    { id: "continue", label: "Continue", icon: "✍️" },
  ];

  const handleAction = async (actionId) => {
    setLoadingAction(actionId);
    await onApplyAction(actionId);
    setLoadingAction(null);
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setLoadingAction("custom");
    await onCustomAsk(customPrompt.trim());
    setLoadingAction(null);
    setCustomPrompt("");
    setShowAskInput(false);
  };

  return (
    <div
      className="fixed z-50 bg-bg-primary rounded-2xl shadow-2xl border border-border-primary p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150"
      style={{
        top: Math.max(10, position.top - 55),
        left: Math.max(10, Math.min(window.innerWidth - 420, position.left)),
      }}
    >
      {/* Quick Action Pills */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-sm sm:max-w-md py-0.5 custom-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-md shrink-0 flex items-center gap-1">
          <span>AI</span>
        </span>

        {quickActions.slice(0, 5).map((act) => (
          <button
            key={act.id}
            onClick={() => handleAction(act.id)}
            disabled={!!loadingAction}
            className="text-xs px-2.5 py-1 rounded-lg bg-bg-secondary hover:bg-brand-purple/10 hover:text-brand-purple text-text-primary transition-all font-medium whitespace-nowrap shrink-0 flex items-center gap-1 border border-border-primary hover:border-brand-purple/30 disabled:opacity-50"
          >
            <span>{act.icon}</span>
            <span>{act.label}</span>
            {loadingAction === act.id && <span className="animate-spin text-[10px]">⏳</span>}
          </button>
        ))}

        <button
          onClick={() => setShowAskInput(!showAskInput)}
          className="text-xs px-2.5 py-1 rounded-lg bg-brand-purple text-white hover:bg-brand-purple/90 font-bold whitespace-nowrap shrink-0 flex items-center gap-1 shadow-sm"
        >
          <span>Ask AI...</span>
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-bg-secondary text-text-muted hover:text-text-primary text-xs shrink-0"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Expanded Custom Input */}
      {showAskInput && (
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 pt-1 border-t border-border-primary">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask AI to modify selected text (e.g., 'convert to a bullet list')..."
            autoFocus
            className="flex-1 bg-bg-secondary text-xs text-text-primary px-3 py-1.5 rounded-lg border border-border-primary focus:outline-none focus:border-brand-purple placeholder:text-text-muted"
          />
          <button
            type="submit"
            disabled={!customPrompt.trim() || !!loadingAction}
            className="text-xs font-bold px-3 py-1.5 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 transition-colors shrink-0"
          >
            {loadingAction === "custom" ? "Generating..." : "Apply ✨"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SelectionAIToolbar;
