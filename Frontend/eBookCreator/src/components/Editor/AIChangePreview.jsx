import React from "react";
import Button from "../ui/Button";

const AIChangePreview = ({
  original,
  suggested,
  instruction,
  onAccept,
  onReject,
  onTryAgain,
  isApplying = false,
}) => {
  if (!suggested) return null;

  return (
    <div className="bg-bg-primary rounded-2xl border border-brand-purple/40 shadow-2xl p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-primary mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-purple"></span>
          </span>
          <h4 className="font-display font-bold text-sm text-text-primary">
            AI Change Preview
          </h4>
        </div>
        {instruction && (
          <span className="text-[11px] font-mono text-brand-purple bg-brand-purple/10 px-2.5 py-0.5 rounded-full truncate max-w-xs">
            "{instruction}"
          </span>
        )}
      </div>

      {/* Side-by-side or Stacked Diff View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        
        {/* Original Content */}
        <div className="bg-bg-secondary rounded-xl border border-border-primary p-4 flex flex-col max-h-72 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
              Original
            </span>
          </div>
          <div 
            className="text-xs text-text-secondary leading-relaxed space-y-2 opacity-80"
            dangerouslySetInnerHTML={{ __html: original || "<p><em>(Empty or new section)</em></p>" }}
          />
        </div>

        {/* AI Suggested Content */}
        <div className="bg-emerald-500/[0.03] dark:bg-emerald-950/[0.1] rounded-xl border border-emerald-500/30 p-4 flex flex-col max-h-72 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              AI Suggested
            </span>
          </div>
          <div 
            className="text-xs text-text-primary leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: suggested }}
          />
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border-primary">
        <button
          type="button"
          onClick={onReject}
          disabled={isApplying}
          className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded-xl border border-border-primary transition-colors"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          disabled={isApplying}
          className="px-4 py-2 text-xs font-bold text-brand-purple hover:bg-brand-purple/10 rounded-xl border border-brand-purple/30 transition-colors"
        >
          Try Again 🔄
        </button>
        <Button
          type="button"
          variant="primary"
          onClick={onAccept}
          disabled={isApplying}
          className="px-5 py-2 text-xs font-bold rounded-xl shadow-md"
        >
          {isApplying ? "Applying..." : "Accept Changes ✓"}
        </Button>
      </div>

    </div>
  );
};

export default AIChangePreview;
