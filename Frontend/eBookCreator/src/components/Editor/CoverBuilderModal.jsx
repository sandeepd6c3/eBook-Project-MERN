import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import BookCover from "./BookCover";

const CoverBuilderModal = ({
  isOpen,
  onClose,
  initialConfig,
  bookTitle,
  authorName,
  onSaveCover,
  onGenerateAICover,
  isGeneratingAI,
}) => {
  const [config, setConfig] = useState(
    initialConfig || {
      gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      style: "modern",
      subtitle: "FIRST EDITION",
      title: "",
      imageUrl: "",
    }
  );

  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    if (initialConfig) {
      setConfig({
        gradient: initialConfig.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)",
        style: initialConfig.style || "modern",
        subtitle: initialConfig.subtitle || "FIRST EDITION",
        title: initialConfig.title || bookTitle || "",
        imageUrl: initialConfig.imageUrl || "",
      });
    }
  }, [initialConfig, bookTitle]);

  const presetGradients = [
    { name: "Ocean Blue", value: "linear-gradient(135deg, #1e3a8a, #3b82f6)" },
    { name: "Cosmic Purple", value: "linear-gradient(135deg, #581c87, #9333ea)" },
    { name: "Emerald Forest", value: "linear-gradient(135deg, #064e3b, #10b981)" },
    { name: "Sunset Crimson", value: "linear-gradient(135deg, #881337, #f43f5e)" },
    { name: "Charcoal Minimal", value: "linear-gradient(135deg, #18181b, #3f3f46)" },
    { name: "Golden Amber", value: "linear-gradient(135deg, #78350f, #d97706)" },
  ];

  const handleSave = () => {
    onSaveCover(config);
    onClose();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGeneratingAI) return;
    const url = await onGenerateAICover(aiPrompt.trim());
    if (url) {
      setConfig((prev) => ({ ...prev, imageUrl: url }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="eBook Cover Studio" maxWidth="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left">
        
        {/* Left Cover Preview (3D View) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-48 shadow-2xl rounded-r-md">
            <BookCover
              config={config}
              title={config.title || bookTitle || "Book Title"}
              author={authorName || "Author"}
              className="w-full"
            />
          </div>
          <span className="text-[10px] text-text-muted mt-3 font-mono">
            Style: {config.style.toUpperCase()}
          </span>
        </div>

        {/* Right Settings */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Subtitle / Edition */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Subtitle or Edition Label
            </label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              placeholder="e.g. FIRST EDITION / COMPLETE GUIDE"
              className="w-full text-xs bg-bg-secondary border border-border-primary rounded-xl p-2.5 text-text-primary focus:outline-none"
            />
          </div>

          {/* Style Layout Preset */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Typography & Layout Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "modern", label: "Modern Classic" },
                { id: "editorial", label: "Editorial Serif" },
                { id: "minimalist", label: "Minimalist Mono" },
                { id: "geometric", label: "Bold Geometric" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setConfig({ ...config, style: st.id })}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    config.style === st.id
                      ? "bg-brand-purple/10 border-brand-purple text-brand-purple"
                      : "bg-bg-secondary border-border-primary text-text-secondary hover:border-text-muted"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Background Color Scheme
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {presetGradients.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setConfig({ ...config, gradient: g.value, imageUrl: "" })}
                  className={`h-8 rounded-lg border transition-all relative overflow-hidden ${
                    config.gradient === g.value && !config.imageUrl
                      ? "ring-2 ring-brand-purple border-transparent"
                      : "border-border-primary opacity-85 hover:opacity-100"
                  }`}
                  style={{ background: g.value }}
                  title={g.name}
                />
              ))}
            </div>
          </div>

          {/* AI Cover Art Generator */}
          <div className="pt-2 border-t border-border-primary">
            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1 mb-1">
              <span>Generate AI Background Art</span>
            </label>
            <form onSubmit={handleGenerate} className="flex gap-1.5">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe cover scene (e.g. 'futuristic glowing neon cyber city')..."
                className="flex-1 text-xs bg-bg-secondary border border-border-primary rounded-xl p-2 text-text-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || isGeneratingAI}
                className="px-3 py-2 text-xs font-bold bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 disabled:opacity-50 transition-colors shrink-0"
              >
                {isGeneratingAI ? "Painting..." : "Generate ✨"}
              </button>
            </form>
            {config.imageUrl && (
              <button
                type="button"
                onClick={() => setConfig({ ...config, imageUrl: "" })}
                className="text-[10px] text-rose-500 hover:underline mt-1 block"
              >
                Remove custom image and revert to gradient
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-text-secondary bg-bg-secondary hover:bg-bg-tertiary rounded-xl border border-border-primary"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              className="px-6 py-2 text-xs font-bold rounded-xl"
            >
              Apply Cover Changes ✓
            </Button>
          </div>

        </div>

      </div>
    </Modal>
  );
};

export default CoverBuilderModal;
