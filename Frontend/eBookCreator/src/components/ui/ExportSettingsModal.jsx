import React, { useState, useEffect } from "react";
import Button from "./Button";

const ExportSettingsModal = ({ isOpen, onClose, exportConfig, onSave, onExport }) => {
  const [config, setConfig] = useState({
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
    footerStyle: "page-center",
    ...exportConfig
  });

  const [previewTab, setPreviewTab] = useState("content"); // "cover" | "content" | "toc"

  useEffect(() => {
    if (exportConfig) {
      setConfig((prev) => ({ ...prev, ...exportConfig }));
    }
  }, [exportConfig]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleCustomMarginChange = (edge, val) => {
    const numeric = parseFloat(val) || 0;
    setConfig((prev) => ({
      ...prev,
      customMargins: {
        ...prev.customMargins,
        [edge]: numeric,
      },
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  // Maps for font styling in preview
  const fontClassMap = {
    Lora: "font-serif",
    Georgia: "font-serif",
    "Playfair Display": "font-display",
    Outfit: "font-sans",
    Inter: "font-sans",
  };

  // Preview page padding based on margin style
  const getPreviewPadding = () => {
    if (config.marginStyle === "compact") return "p-3 text-[10px]";
    if (config.marginStyle === "wide") return "p-8 text-[12px]";
    if (config.marginStyle === "custom") {
      return {
        paddingTop: `${Math.min(config.customMargins.top * 12, 40)}px`,
        paddingBottom: `${Math.min(config.customMargins.bottom * 12, 40)}px`,
        paddingLeft: `${Math.min(config.customMargins.left * 12, 40)}px`,
        paddingRight: `${Math.min(config.customMargins.right * 12, 40)}px`,
      };
    }
    return "p-5 text-[11px]"; // normal
  };

  const paddingStyle = typeof getPreviewPadding() === "object" ? getPreviewPadding() : {};
  const paddingClass = typeof getPreviewPadding() === "string" ? getPreviewPadding() : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Modal Dialog Box */}
      <div 
        id="export-settings-modal"
        className="bg-bg-primary border border-border-primary w-full max-w-[860px] h-[90vh] md:h-[80vh] rounded-[28px] shadow-2xl overflow-hidden flex flex-col animate-scaleUp text-text-primary transition-colors duration-250"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-border-primary shrink-0">
          <div>
            <h3 className="font-display font-light text-xl text-text-primary tracking-tight">
              ⚙️ Export Layout & Styling Builder
            </h3>
            <p className="text-[10px] text-text-muted font-medium mt-0.5">
              Customize typography, page dimensions, and alignments prior to compiling.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1.5 hover:bg-bg-secondary rounded-lg"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* LEFT: Controls Panel */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-border-primary">
            
            {/* Page Size & Margins */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-accent-primary">
                1. Page Dimensions
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary pl-1">Page Size</label>
                  <select
                    value={config.pageSize}
                    onChange={(e) => handleChange("pageSize", e.target.value)}
                    className="h-9 px-3 bg-bg-secondary text-text-primary border border-border-primary rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="letter">Letter (8.5&quot; x 11&quot;)</option>
                    <option value="a4">A4 Standard</option>
                    <option value="a5">A5 Digest</option>
                    <option value="pocket">Pocket Book (5&quot; x 8&quot;)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary pl-1">Margin Layout</label>
                  <select
                    value={config.marginStyle}
                    onChange={(e) => handleChange("marginStyle", e.target.value)}
                    className="h-9 px-3 bg-bg-secondary text-text-primary border border-border-primary rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="normal">Normal (1&quot;)</option>
                    <option value="compact">Compact (0.5&quot;)</option>
                    <option value="wide">Wide (1.5&quot;)</option>
                    <option value="custom">Custom Margins</option>
                  </select>
                </div>
              </div>

              {/* Custom Margins Input Grid */}
              {config.marginStyle === "custom" && (
                <div className="grid grid-cols-4 gap-2 bg-bg-secondary p-3 rounded-xl border border-border-primary animate-fadeIn mt-1.5">
                  {[
                    { label: "Top (in)", edge: "top" },
                    { label: "Bottom (in)", edge: "bottom" },
                    { label: "Left (in)", edge: "left" },
                    { label: "Right (in)", edge: "right" },
                  ].map((m) => (
                    <div key={m.edge} className="flex flex-col gap-1">
                      <label className="text-[8px] font-bold text-text-muted uppercase tracking-wider text-center">{m.label}</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.2"
                        max="3.0"
                        value={config.customMargins[m.edge]}
                        onChange={(e) => handleCustomMarginChange(m.edge, e.target.value)}
                        className="h-8 w-full text-center bg-bg-primary text-text-primary border border-border-primary rounded-lg text-xs outline-none focus:border-accent-primary"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Typography */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-accent-primary">
                2. Typography & Text Spacing
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary pl-1">Font Family</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => handleChange("fontFamily", e.target.value)}
                    className="h-9 px-3 bg-bg-secondary text-text-primary border border-border-primary rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="Lora">Lora (Serif Classic)</option>
                    <option value="Georgia">Georgia (Serif Modern)</option>
                    <option value="Playfair Display">Playfair (Serif Editorial)</option>
                    <option value="Outfit">Outfit (Sans Elegant)</option>
                    <option value="Inter">Inter (Sans Clean)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary pl-1">Alignment</label>
                  <select
                    value={config.textAlignment}
                    onChange={(e) => handleChange("textAlignment", e.target.value)}
                    className="h-9 px-3 bg-bg-secondary text-text-primary border border-border-primary rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="justify">Justified</option>
                    <option value="left">Left Aligned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-1.5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-text-secondary">Font Size</label>
                    <span className="text-[10px] font-bold text-text-muted font-mono">{config.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={config.fontSize}
                    onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
                    className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary my-2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-text-secondary">Line Height</label>
                    <span className="text-[10px] font-bold text-text-muted font-mono">{config.lineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.2"
                    step="0.1"
                    value={config.lineHeight}
                    onChange={(e) => handleChange("lineHeight", parseFloat(e.target.value))}
                    className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary my-2"
                  />
                </div>
              </div>
            </div>

            {/* Layout Toggles */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-accent-primary">
                3. Page Layout & Content Configuration
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 bg-bg-secondary p-4 rounded-xl border border-border-primary">
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Include Cover Page</span>
                    <span className="text-[9px] text-text-muted">Generate full cover design</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.includeCover}
                    onChange={(e) => handleChange("includeCover", e.target.checked)}
                    className="w-4 h-4 text-accent-primary bg-bg-primary border-border-primary rounded focus:ring-accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Include TOC</span>
                    <span className="text-[9px] text-text-muted">Table of Contents sheet</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.includeTOC}
                    onChange={(e) => handleChange("includeTOC", e.target.checked)}
                    className="w-4 h-4 text-accent-primary bg-bg-primary border-border-primary rounded focus:ring-accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border-primary/50 pt-3 col-span-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Chapter Page Breaks</span>
                    <span className="text-[9px] text-text-muted">Start each chapter on a new page</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.chapterPageBreaks}
                    onChange={(e) => handleChange("chapterPageBreaks", e.target.checked)}
                    className="w-4 h-4 text-accent-primary bg-bg-primary border-border-primary rounded focus:ring-accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Header & Footers */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-accent-primary">
                4. Running Headers & Footers
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary pl-1">Header Style</label>
                  <select
                    value={config.headerStyle}
                    onChange={(e) => handleChange("headerStyle", e.target.value)}
                    className="h-9 px-3 bg-bg-secondary text-text-primary border border-border-primary rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="title-chapter">Book Title | Chapter Name</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary pl-1">Footer Style</label>
                  <select
                    value={config.footerStyle}
                    onChange={(e) => handleChange("footerStyle", e.target.value)}
                    className="h-9 px-3 bg-bg-secondary text-text-primary border border-border-primary rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="none">None (No Page Numbers)</option>
                    <option value="page-center">Center Page Numbers</option>
                    <option value="page-right">Right Page Numbers</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Scaled Live Preview */}
          <div className="w-full md:w-[360px] bg-bg-tertiary p-5 flex flex-col justify-start items-center shrink-0 min-h-0 overflow-y-auto">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-text-muted mb-4 self-start">
              Live Layout Preview
            </span>
            
            {/* Toggle Preview Page Tabs */}
            <div className="flex bg-bg-secondary p-1 rounded-xl border border-border-primary w-full gap-1 mb-4 text-[10px] font-bold uppercase tracking-wider">
              {config.includeCover && (
                <button
                  type="button"
                  onClick={() => setPreviewTab("cover")}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                    previewTab === "cover" ? "bg-bg-primary text-text-primary shadow-2xs" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Cover
                </button>
              )}
              {config.includeTOC && (
                <button
                  type="button"
                  onClick={() => setPreviewTab("toc")}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                    previewTab === "toc" ? "bg-bg-primary text-text-primary shadow-2xs" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  TOC
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewTab("content")}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                  previewTab === "content" ? "bg-bg-primary text-text-primary shadow-2xs" : "text-text-muted hover:text-text-primary"
                }`}
              >
                Page
              </button>
            </div>

            {/* Dynamic Book Page Canvas Mockup */}
            <div 
              className={`w-full bg-bg-primary border border-border-primary rounded-2xl shadow-lg relative select-none flex flex-col overflow-hidden text-text-primary transition-all duration-300 ${
                config.pageSize === "pocket" ? "aspect-[5/8] max-w-[230px]" : "aspect-[1/1.4] max-w-[250px]"
              }`}
            >
              {previewTab === "cover" ? (
                /* Cover Page Design Preview */
                <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 p-5 flex flex-col items-center justify-between text-center text-white relative">
                  <div className="w-full border-b border-white/10 pb-1 pt-4">
                    <span className="text-[6px] tracking-widest uppercase opacity-70">A Masterpiece eBook</span>
                  </div>
                  <div className="my-auto">
                    <h5 className="font-display font-light text-[13px] tracking-wide mb-1 leading-snug">The Book Title</h5>
                    <div className="w-4 h-[1px] bg-white/40 my-2.5 mx-auto"></div>
                    <span className="text-[8px] opacity-80 italic font-serif">by Sandeep</span>
                  </div>
                  <div className="w-full text-[6px] opacity-40 uppercase tracking-widest font-mono pb-2">
                    Published with eBookAI
                  </div>
                </div>
              ) : previewTab === "toc" ? (
                /* TOC Preview */
                <div className="flex-1 flex flex-col justify-between p-5 font-sans">
                  <div>
                    <h5 className="font-display font-bold text-center text-xs border-b border-border-primary pb-1.5 mb-4 text-text-primary">
                      Table of Contents
                    </h5>
                    <div className="flex flex-col gap-2.5 text-[8px] font-medium text-text-secondary">
                      <div className="flex justify-between items-center">
                        <span>Chapter 1: The Beginning</span>
                        <span className="flex-1 border-b border-dashed border-border-primary mx-1.5 h-1"></span>
                        <span className="font-mono text-text-muted">1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Chapter 2: Scaling the Climb</span>
                        <span className="flex-1 border-b border-dashed border-border-primary mx-1.5 h-1"></span>
                        <span className="font-mono text-text-muted">9</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Chapter 3: Looking Ahead</span>
                        <span className="flex-1 border-b border-dashed border-border-primary mx-1.5 h-1"></span>
                        <span className="font-mono text-text-muted">21</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-[7px] text-text-muted font-mono">
                    Page 3
                  </div>
                </div>
              ) : (
                /* Standard Content Page Preview */
                <div 
                  style={paddingStyle}
                  className={`flex-1 flex flex-col justify-between min-h-0 ${paddingClass} ${fontClassMap[config.fontFamily]}`}
                >
                  {/* Running Header */}
                  {config.headerStyle === "title-chapter" ? (
                    <div className="flex items-center justify-between text-[7px] text-text-muted border-b border-border-primary/50 pb-1.5 select-none uppercase tracking-widest font-mono shrink-0 mb-3">
                      <span className="truncate max-w-[90px]">My eBook Title</span>
                      <span className="truncate max-w-[80px]">Chapter 1</span>
                    </div>
                  ) : (
                    <div className="h-2 shrink-0"></div>
                  )}

                  {/* Body Content */}
                  <div 
                    style={{ 
                      fontSize: `${Math.max(config.fontSize - 6, 8)}px`, 
                      lineHeight: config.lineHeight,
                    }}
                    className={`flex-1 overflow-hidden leading-relaxed text-text-secondary ${
                      config.textAlignment === "justify" ? "text-justify" : "text-left"
                    }`}
                  >
                    <h5 className="font-display font-semibold text-[11px] mb-2 leading-tight text-text-primary">
                      Chapter 1: The Genesis
                    </h5>
                    <p className="mb-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec feugiat lectus, sed lobortis leo. Mauris ultrices tempor sapien, elementum pulvinar.
                    </p>
                    <p>
                      Donec congue lorem at ante iaculis eleifend. Duis ac eleifend turpis. Integer a urna a nisl iaculis gravida at vel ligula.
                    </p>
                  </div>

                  {/* Running Footer */}
                  {config.footerStyle !== "none" ? (
                    <div className={`text-[7px] font-mono text-text-muted mt-3 pt-1.5 border-t border-border-primary/30 shrink-0 ${
                      config.footerStyle === "page-right" ? "text-right" : "text-center"
                    }`}>
                      11
                    </div>
                  ) : (
                    <div className="h-2 shrink-0"></div>
                  )}
                </div>
              )}
            </div>

            {/* Display Stats Info */}
            <div className="mt-4 bg-bg-secondary p-3 rounded-xl border border-border-primary text-[10px] w-full text-text-secondary flex flex-col gap-1 font-medium">
              <div className="flex justify-between">
                <span>Print Bounds:</span>
                <span className="font-mono text-text-primary capitalize">{config.pageSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Alignment:</span>
                <span className="font-mono text-text-primary capitalize">{config.textAlignment}</span>
              </div>
              <div className="flex justify-between">
                <span>Margins:</span>
                <span className="font-mono text-text-primary capitalize">{config.marginStyle}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4.5 bg-bg-secondary border-t border-border-primary flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border-primary text-text-secondary hover:text-text-primary bg-bg-primary rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onExport("pdf", config)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-none shadow-xs"
            >
              📄 PDF
            </button>
            <button
              onClick={() => onExport("epub", config)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-none shadow-xs"
            >
              📕 EPUB
            </button>
            <button
              onClick={() => onExport("docx", config)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-none shadow-xs"
            >
              🟦 DOCX
            </button>
            <button
              onClick={() => onExport("markdown", config)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-none shadow-xs"
            >
              📝 Markdown
            </button>
            <div className="w-px h-5 bg-border-primary mx-1"></div>
            <Button
              variant="secondary"
              onClick={handleSave}
              className="text-[9px] font-bold tracking-widest uppercase px-4 py-2"
            >
              Save Style
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExportSettingsModal;
