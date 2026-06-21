import React from "react";
import { Link } from "react-router-dom";

const Features = () => {
  const featuresList = [
    {
      category: "Pipeline Core",
      title: "Asynchronous Chunking",
      volume: "Vol. 01",
      subtitle: "Context Limit Bypass",
      description: "Drafts chapters sequentially in the background to bypass standard LLM context token output ceiling.",
      color: "from-blue-500 to-cyan-500",
      version: "v1.0.0",
      rating: 5,
    },
    {
      category: "Narrative Logic",
      title: "Semantic Anchors",
      volume: "Vol. 02",
      subtitle: "Context Anchor Memory",
      description: "Carries a dynamic running summary context memory across chapters to ensure seamless flow and prevent repetition.",
      color: "from-purple-500 to-indigo-500",
      version: "v1.2.0",
      rating: 5,
    },
    {
      category: "Image Assets",
      title: "Imagen 3 Style Locking",
      volume: "Vol. 03",
      subtitle: "Visual Style Anchor",
      description: "Appends fixed prompt modifier tags to ensure all generated chapter illustration plates share a unified visual style.",
      color: "from-rose-500 to-orange-500",
      version: "v2.0.0",
      rating: 5,
    },
    {
      category: "Compiler Engine",
      title: "Multi-Format Export",
      volume: "Vol. 04",
      subtitle: "Layout Compiler",
      description: "Recalculates page sizes, margins, headers, and footers to output beautifully aligned PDF or Word documents.",
      color: "from-emerald-500 to-teal-500",
      version: "v1.5.0",
      rating: 5,
    },
  ];

  return (
    <section id="features" className="py-24 bg-bg-primary border-b border-border-primary scroll-mt-20 transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-text-primary mb-2">
            Top eBook AI Features
          </h2>
          <p className="text-text-secondary text-xs">
            Explore the core architectural blocks that power our ebook generation pipeline.
          </p>
        </div>

        {/* Grid matching the "Top Trending Book" layout from screenshots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresList.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              
              {/* 3D-like Book Cover mockup (CSS-based) */}
              <div className="w-44 h-60 bg-bg-secondary mb-6 relative shadow-md group-hover:shadow-lg group-hover:-translate-y-2 transition-all duration-300 rounded-[1px] overflow-hidden border border-border-primary flex flex-col justify-between p-4">
                {/* Spine shadow */}
                <div className="absolute top-0 left-0 w-2 h-full bg-text-primary/[0.06] pointer-events-none"></div>
                <div className="absolute top-0 left-2 w-[1px] h-full bg-text-primary/[0.03] pointer-events-none"></div>
                
                <div className="flex items-center justify-between text-[8px] font-bold text-text-muted font-mono">
                  <span>{item.volume}</span>
                  <span>EBOOKAI</span>
                </div>

                <div className="my-auto py-2 text-left pl-2">
                  <div className={`h-1 w-6 bg-gradient-to-r ${item.color} mb-3`}></div>
                  <h4 className="font-display font-semibold text-sm text-text-primary leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[9px] text-text-muted font-mono uppercase tracking-wider mt-1">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-[8px] text-text-muted font-mono border-t border-border-primary pt-2 text-left pl-2">
                  Node module active
                </div>
              </div>

              {/* Category */}
              <span className="text-[9px] font-bold tracking-widest text-text-muted uppercase mb-1">
                {item.category}
              </span>

              {/* Title */}
              <h3 className="font-display font-bold text-text-primary text-sm mb-1 group-hover:text-brand-blue transition-colors duration-200">
                {item.title}
              </h3>

              {/* Star Rating */}
              <div className="flex items-center gap-0.5 text-xs text-amber-400 mb-2">
                {"★".repeat(item.rating)}
              </div>

              {/* Version/Price label */}
              <div className="text-xs font-bold text-brand-purple font-mono mb-3">
                {item.version}
              </div>

              {/* Description */}
              <p className="text-xs text-text-secondary max-w-[200px] leading-relaxed mb-6 min-h-[48px]">
                {item.description}
              </p>

              {/* ADD TO PIPELINE action link */}
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-text-primary border-b border-text-primary pb-0.5 hover:text-brand-blue hover:border-brand-blue transition-colors duration-200"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Launch Node
              </Link>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
