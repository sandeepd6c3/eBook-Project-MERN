import React from "react";

const EditorToolbar = ({ onFormat, onInsertLink, onInsertImage, onInsertDivider, onUndo, onRedo }) => {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-bg-secondary border-b border-border-primary text-text-secondary sticky top-0 z-20 select-none shadow-xs">
      
      {/* History controls */}
      <div className="flex items-center gap-0.5 border-r border-border-primary pr-2 mr-1">
        <button
          type="button"
          onClick={onUndo}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRedo}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10H11a5 5 0 00-5 5v2m15-7l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      {/* Heading dropdown / presets */}
      <div className="flex items-center gap-0.5 border-r border-border-primary pr-2 mr-1">
        <button
          type="button"
          onClick={() => onFormat("formatBlock", "<h1>")}
          className="px-2 py-1 text-xs font-bold rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => onFormat("formatBlock", "<h2>")}
          className="px-2 py-1 text-xs font-bold rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => onFormat("formatBlock", "<h3>")}
          className="px-2 py-1 text-xs font-bold rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => onFormat("formatBlock", "<p>")}
          className="px-2 py-1 text-xs font-medium rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Normal Text"
        >
          ¶
        </button>
      </div>

      {/* Inline styles: Bold, Italic, Underline, Strikethrough, Code */}
      <div className="flex items-center gap-0.5 border-r border-border-primary pr-2 mr-1">
        <button
          type="button"
          onClick={() => onFormat("bold")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary font-bold text-xs"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => onFormat("italic")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary italic text-xs"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => onFormat("underline")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary underline text-xs"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => onFormat("strikeThrough")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary line-through text-xs"
          title="Strikethrough"
        >
          S
        </button>
      </div>

      {/* Lists & Quotes */}
      <div className="flex items-center gap-0.5 border-r border-border-primary pr-2 mr-1">
        <button
          type="button"
          onClick={() => onFormat("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16M2 6h.01M2 12h.01M2 18h.01" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onFormat("insertOrderedList")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6h13M7 12h13M7 18h13M3 6h1v4M3 12h2M3 18h2" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onFormat("formatBlock", "<blockquote>")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Quote Block"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onFormat("formatBlock", "<pre>")}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary font-mono text-xs"
          title="Code Block"
        >
          {"</>"}
        </button>
      </div>

      {/* Insert Links, Images, Dividers */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onInsertLink}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Insert Link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onInsertImage}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          title="Insert Image URL"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onInsertDivider}
          className="p-1.5 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs font-bold"
          title="Insert Horizontal Divider"
        >
          ―
        </button>
      </div>

    </div>
  );
};

export default EditorToolbar;
