import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const Hero = () => {
  const [topicInput, setTopicInput] = useState("");
  const navigate = useNavigate();

  const handleQuickCreate = (e) => {
    e.preventDefault();
    if (topicInput.trim()) {
      navigate(`/signup?topic=${encodeURIComponent(topicInput.trim())}`);
    } else {
      navigate("/signup");
    }
  };

  const samplePrompts = [
    "The 2026 AI Playbook for Solopreneurs",
    "Mindful Stoicism: Daily Resilience Habits",
    "Mastering Modern TypeScript & Cloud Architecture"
  ];

  return (
    <section className="relative bg-bg-secondary overflow-x-hidden pt-10 pb-20 md:pt-16 md:pb-28 border-b border-border-primary flex flex-col transition-colors duration-250">
      {/* Dynamic ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-purple/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-brand-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10 w-full">
        
        {/* Left Column (Content & Interactive Try Prompt) */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-[11px] font-bold tracking-wider uppercase mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-purple animate-ping"></span>
            Next-Gen AI Book Authoring
          </div>
          
          <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-[1.12] tracking-tight mb-6">
            From Idea to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-blue font-semibold italic">
              Published eBook
            </span> <br />
            in Minutes.
          </h1>
          
          <p className="max-w-xl text-text-secondary text-sm sm:text-base leading-relaxed mb-8">
            Turn any title, prompt, or outline into a complete, beautifully structured, and publication-ready digital book with automated chapters, custom covers, and multi-format exports.
          </p>

          {/* Interactive Fast-Prompt Input Box */}
          <form onSubmit={handleQuickCreate} className="w-full max-w-lg mb-4">
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-1.5 bg-bg-primary rounded-2xl border border-border-primary shadow-lg shadow-brand-purple/5 focus-within:border-brand-purple focus-within:ring-2 focus-within:ring-brand-purple/20 transition-all">
              <div className="flex items-center pl-3 flex-grow gap-2">
                <svg className="w-4 h-4 text-brand-purple shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Enter your book topic or title..."
                  className="w-full py-2.5 bg-transparent text-xs sm:text-sm text-text-primary focus:outline-none placeholder:text-text-muted"
                />
              </div>
              <Button type="submit" variant="primary" className="rounded-xl px-5 py-3 text-xs font-bold tracking-wider whitespace-nowrap shadow-sm">
                Generate eBook ✨
              </Button>
            </div>
          </form>

          {/* Sample Prompts Pills */}
          <div className="w-full max-w-lg flex flex-wrap items-center gap-1.5 mb-8">
            <span className="text-[10px] uppercase font-bold text-text-muted mr-1">Try:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopicInput(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-tertiary hover:bg-brand-purple/10 hover:text-brand-purple text-text-secondary transition-colors text-left truncate max-w-[280px]"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Key Metrics Banner */}
          <div className="w-full max-w-lg border-t border-border-primary pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="font-display font-bold text-text-primary text-lg sm:text-xl">100% Free</span>
                <span className="text-[11px] text-text-muted">Full AI Access</span>
              </div>
              <div className="flex flex-col border-l border-border-primary pl-4">
                <span className="font-display font-bold text-text-primary text-lg sm:text-xl">4 Formats</span>
                <span className="text-[11px] text-text-muted">PDF, EPUB, DOCX, MD</span>
              </div>
              <div className="flex flex-col border-l border-border-primary pl-4">
                <span className="font-display font-bold text-text-primary text-lg sm:text-xl">Full Rights</span>
                <span className="text-[11px] text-text-muted">Commercial & KDP</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Mockup Card & Visual */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end relative w-full items-center">
          <div className="relative w-full max-w-lg">
            
            {/* Background ambient glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-purple to-brand-blue rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            {/* Main Interactive Preview Container */}
            <div className="relative bg-bg-primary rounded-2xl border border-border-primary shadow-2xl overflow-hidden p-5 sm:p-7">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-primary">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-[11px] font-mono text-text-muted ml-2">eBookStudio AI • Live Preview</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Ready to Export
                </span>
              </div>

              {/* Book Showcase Grid inside card */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Book Cover Thumbnail */}
                <div className="sm:col-span-5 aspect-[3/4] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-xl p-4 flex flex-col justify-between text-white shadow-md relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-brand-blue/30 rounded-full blur-xl"></div>
                  <div className="text-[8px] font-bold tracking-widest uppercase opacity-80">Vol. 01 • Bestseller Edition</div>
                  <div>
                    <div className="h-0.5 w-6 bg-brand-purple mb-2"></div>
                    <h3 className="font-display font-bold text-sm sm:text-base leading-tight">Mastering AI Workflows</h3>
                    <p className="text-[9px] opacity-75 mt-1 font-sans">Architecting next-gen digital systems</p>
                  </div>
                  <div className="flex items-center justify-between text-[8px] opacity-80 border-t border-white/10 pt-2">
                    <span>eBookAI Studio</span>
                    <span>2026</span>
                  </div>
                </div>

                {/* Chapter Outline Summary */}
                <div className="sm:col-span-7 flex flex-col gap-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">Generated Outline</span>
                    <span className="text-[10px] text-brand-purple font-semibold">12 Chapters Complete</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-bg-secondary border border-border-primary flex items-center justify-between">
                      <span className="text-xs text-text-primary font-medium truncate">1. Foundations of Prompt Systems</span>
                      <span className="text-[10px] text-emerald-600 font-bold ml-2">1,840 w</span>
                    </div>
                    <div className="p-2 rounded-lg bg-bg-secondary border border-border-primary flex items-center justify-between">
                      <span className="text-xs text-text-primary font-medium truncate">2. Asynchronous Narrative Loops</span>
                      <span className="text-[10px] text-emerald-600 font-bold ml-2">2,150 w</span>
                    </div>
                    <div className="p-2 rounded-lg bg-bg-secondary border border-border-primary flex items-center justify-between">
                      <span className="text-xs text-text-primary font-medium truncate">3. Multi-Format Output Engines</span>
                      <span className="text-[10px] text-emerald-600 font-bold ml-2">1,920 w</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link to="/signup" className="flex-1">
                      <Button variant="primary" className="w-full py-2.5 text-[11px] font-bold rounded-lg">
                        Open in Editor
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default Hero;
