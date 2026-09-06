import React from "react";
import InteractiveTilt from "../ui/InteractiveTilt";

const Features = () => {
  const features = [
    {
      title: "Intelligent Outlining",
      description: "Generate comprehensive chapter roadmaps and section topics tailored to your subject, difficulty level, and reader audience.",
      icon: (
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
    {
      title: "Context-Aware Chapter Drafting",
      description: "Write full, deeply structured chapters with consistent tone and narrative flow without repetitive phrasing or context loss.",
      icon: (
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18.477s-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "In-Editor AI Instructions",
      description: "Instruct AI in plain language to rewrite sections, add concrete examples, generate practice exercises, or simplify technical concepts.",
      icon: (
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      title: "Selection Floating Copilot",
      description: "Highlight any paragraph to immediately fix grammar, adjust tone, expand details, or ask custom questions specifically for that text.",
      icon: (
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Non-Destructive Diff Previews",
      description: "Always review side-by-side comparisons of original versus AI-suggested content before accepting changes to your chapters.",
      icon: (
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Multi-Format Export Suite",
      description: "Download publication-ready PDFs with cover pages and automatic table of contents, or export to editable DOCX and EPUB formats.",
      icon: (
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="py-20 bg-bg-primary border-b border-border-primary scroll-mt-16 transition-colors duration-250">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
            Features & Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
            Designed for thoughtful writing and seamless publishing.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Every feature is crafted to support the actual writing lifecycle, giving you creative control while eliminating repetitive formatting work.
          </p>
        </div>

        {/* 3D Tilt Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <InteractiveTilt
              key={index}
              maxTilt={4}
              scale={1.015}
              glow={true}
              className="h-full"
            >
              <div className="h-full p-6 rounded-xl bg-bg-secondary border border-border-primary hover:border-text-muted hover:shadow-lg transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-bg-primary border border-border-primary flex items-center justify-center mb-4 shadow-xs">
                    {item.icon}
                  </div>
                  <h3 className="font-sans font-semibold text-base text-text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </InteractiveTilt>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
