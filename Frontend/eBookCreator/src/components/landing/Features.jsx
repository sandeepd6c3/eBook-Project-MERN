import React from "react";
import { Link } from "react-router-dom";

const Features = () => {
  const featuresList = [
    {
      category: "AI Generation",
      title: "Smart Outlining & Structuring",
      description: "Generate complete chapter roadmaps, target audience hooks, and narrative themes tailored to your book's topic in seconds.",
      icon: (
        <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: "Gemini 2.5 Pro",
    },
    {
      category: "Cohesive Writing",
      title: "Context-Aware Drafting",
      description: "Sequential chapter writing carries forward previous chapter context so your entire book maintains a natural, consistent flow without repetitions.",
      icon: (
        <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      badge: "Memory Engine",
    },
    {
      category: "Design Studio",
      title: "Custom Cover & Plate Art",
      description: "Craft eye-catching paperback and digital covers using custom gradients, typography themes, and AI-generated illustration styles.",
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: "Cover Studio",
    },
    {
      category: "Publishing Suite",
      title: "Multi-Format Instant Export",
      description: "Export clean, perfectly paginated PDFs, editable Word DOCX files, standard EPUB packages, and Markdown files ready for Kindle KDP or print.",
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      badge: "4 Formats",
    },
    {
      category: "Interactive Editing",
      title: "Real-time Chapter Workspace",
      description: "Effortlessly rearrange chapters, re-generate specific sections, rewrite paragraphs with AI, or polish prose with zero lag.",
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      badge: "Live Editor",
    },
    {
      category: "Community & Growth",
      title: "Discover Hub & Reader Ratings",
      description: "Publish your creations to the public library, gather reader ratings and reviews, and monitor your books' reader engagement stats in real-time.",
      icon: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: "Author Analytics",
    },
  ];

  return (
    <section id="features" className="py-24 bg-bg-primary border-b border-border-primary scroll-mt-20 transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-purple bg-brand-purple/10 px-3.5 py-1.5 rounded-full">
            Powerful Authoring Features
          </span>
          <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-text-primary mt-4 mb-3">
            Everything You Need to Write & Publish
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            A comprehensive suite of intelligent tools designed to streamline the entire publishing journey from initial idea to distribution.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuresList.map((item, index) => (
            <div 
              key={index} 
              className="bg-bg-secondary border border-border-primary rounded-2xl p-7 flex flex-col justify-between hover:border-brand-purple/40 hover:shadow-xl hover:shadow-brand-purple/5 hover:-translate-y-1 transition-all duration-300 group text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-bg-primary border border-border-primary flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted bg-bg-primary px-2.5 py-1 rounded-md border border-border-primary">
                    {item.badge}
                  </span>
                </div>

                <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase mb-1 block">
                  {item.category}
                </span>

                <h3 className="font-display font-bold text-text-primary text-lg mb-2.5 group-hover:text-brand-purple transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border-primary/60 flex items-center text-xs font-bold text-brand-purple group-hover:translate-x-1 transition-transform">
                <span>Start creating with {item.badge}</span>
                <span className="ml-1.5">➔</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-brand-purple/10 via-brand-blue/10 to-transparent border border-border-primary flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="font-display font-bold text-xl text-text-primary mb-1">
              Ready to create your first book in minutes?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              No credit card or setup required. Enjoy unrestricted access to all features today.
            </p>
          </div>
          <Link 
            to="/signup"
            className="whitespace-nowrap px-6 py-3 rounded-xl bg-text-primary text-bg-primary font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
          >
            Create eBook Free ➔
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Features;
