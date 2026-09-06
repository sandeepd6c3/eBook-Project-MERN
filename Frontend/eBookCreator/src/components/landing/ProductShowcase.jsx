import React from "react";
import { Link } from "react-router-dom";

const ProductShowcase = () => {
  return (
    <section id="preview" className="py-20 bg-bg-primary border-b border-border-primary scroll-mt-16 transition-colors duration-250">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
            The Studio Experience
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
            A real, powerful workspace for writers.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Everything in one place: chapter navigation, rich text formatting, intelligent AI copilots, and instant export controls.
          </p>
        </div>

        {/* Detailed Application Preview Window */}
        <div className="rounded-xl border border-border-primary bg-bg-secondary shadow-lg overflow-hidden text-left">
          
          {/* Window Header */}
          <div className="px-4 py-3 bg-bg-primary border-b border-border-primary flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-text-primary">
                📘 Full-Stack TypeScript Handbook
              </span>
              <span className="text-[11px] text-text-muted font-mono">
                • 12 Chapters • 24,500 words
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Autosaved ✓</span>
              <Link
                to="/signup"
                className="px-3 py-1 rounded bg-text-primary text-bg-primary text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Open Studio
              </Link>
            </div>
          </div>

          {/* 3-Column Studio Layout Preview */}
          <div className="grid grid-cols-12 divide-x divide-border-primary min-h-[440px] bg-bg-primary">
            
            {/* 1. Left Book Sidebar */}
            <div className="col-span-12 md:col-span-3 p-4 bg-bg-secondary/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase">
                <span>Table of Contents</span>
                <span className="text-brand-purple">+ Add</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-lg bg-bg-primary border border-border-primary shadow-xs font-medium text-text-primary flex items-center justify-between">
                  <span>1. Type System Foundations</span>
                  <span className="text-[10px] text-emerald-600">Edited</span>
                </div>
                <div className="p-2.5 rounded-lg hover:bg-bg-primary text-text-secondary transition-colors flex items-center justify-between">
                  <span>2. Generics & Utility Types</span>
                  <span className="text-[10px] text-text-muted">Draft</span>
                </div>
                <div className="p-2.5 rounded-lg hover:bg-bg-primary text-text-secondary transition-colors flex items-center justify-between">
                  <span>3. Async Patterns & Streams</span>
                  <span className="text-[10px] text-text-muted">Draft</span>
                </div>
                <div className="p-2.5 rounded-lg hover:bg-bg-primary text-text-secondary transition-colors flex items-center justify-between">
                  <span>4. Production Backend APIs</span>
                  <span className="text-[10px] text-text-muted">Draft</span>
                </div>
              </div>
            </div>

            {/* 2. Center Document Editor */}
            <div className="col-span-12 md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-bg-primary">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border-primary text-xs text-text-muted font-medium">
                  <span className="text-text-primary font-bold">Heading 2</span>
                  <span>Bold</span>
                  <span>Italic</span>
                  <span>Code Block</span>
                  <span>Link</span>
                  <span>Divider</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-text-primary">
                  1. Type System Foundations & Safety
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  TypeScript adds static type definitions on top of standard JavaScript. By catching potential runtime exceptions during compilation, developers can confidently refactor complex systems and guarantee contract compliance across microservice boundaries.
                </p>

                <div className="p-3.5 rounded-lg bg-bg-secondary border border-border-primary text-xs font-mono text-text-secondary">
                  <span className="text-text-muted">// Defining a strict immutable schema</span><br/>
                  type UserContext = Readonly&lt;{'{'} id: string; role: "admin" | "author" {'}'}&gt;;
                </div>
              </div>

              <div className="pt-4 border-t border-border-primary flex items-center justify-between text-xs text-text-muted">
                <span>Chapter 1 • 1,620 words</span>
                <span>Format: PDF / EPUB ready</span>
              </div>
            </div>

            {/* 3. Right AI Assistant & History */}
            <div className="col-span-12 md:col-span-3 p-4 bg-bg-secondary/40 space-y-4">
              <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-primary flex items-center justify-between">
                <span>AI Assistant</span>
                <span className="text-[10px] text-text-muted">Gemini 3.6</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase block">Natural Language Prompt:</span>
                <div className="p-2 rounded-lg bg-bg-primary border border-border-primary text-xs text-text-secondary">
                  "Add 3 practice exercises on advanced conditional types..."
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 rounded-lg bg-brand-purple text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Generate Content
                </button>
              </div>

              <div className="pt-2 border-t border-border-primary space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase block">Version History:</span>
                <div className="text-[11px] text-text-secondary p-1.5 rounded bg-bg-primary border border-border-primary flex items-center justify-between">
                  <span>AI: Added examples</span>
                  <span className="text-[10px] text-text-muted font-mono">10:14 AM</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductShowcase;
