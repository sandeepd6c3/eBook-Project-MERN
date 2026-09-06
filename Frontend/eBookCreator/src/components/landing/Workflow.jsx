import React from "react";

const Workflow = () => {
  const steps = [
    {
      step: "01",
      name: "Idea",
      title: "Define Concept & Audience",
      desc: "Provide your book topic, tone, and target readers. AI structures the core themes.",
    },
    {
      step: "02",
      name: "Outline",
      title: "Generate Chapter Roadmap",
      desc: "Review and reorder structured chapters and section objectives.",
    },
    {
      step: "03",
      name: "Write",
      title: "Draft In-Depth Chapters",
      desc: "AI produces comprehensive text with examples, exercises, and clean code blocks.",
    },
    {
      step: "04",
      name: "Edit",
      title: "Refine with Natural Language",
      desc: "Highlight text to simplify, rewrite, or polish tone with non-destructive diffs.",
    },
    {
      step: "05",
      name: "Export",
      title: "Publish to Standard Formats",
      desc: "Download formatted PDF, EPUB, DOCX, or Markdown files ready for distribution.",
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-bg-secondary border-b border-border-primary scroll-mt-16 transition-colors duration-250">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
            Publishing Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
            How eBookAI works
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            A structured five-step workflow designed to move from rough concept to finished publication without getting stuck.
          </p>
        </div>

        {/* Horizontal Timeline (Desktop) & Vertical Timeline (Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
          
          {steps.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-bg-primary border border-border-primary flex flex-col justify-between text-left relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-brand-purple">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-2 py-0.5 rounded bg-bg-secondary border border-border-primary">
                    {item.name}
                  </span>
                </div>

                <h3 className="font-sans font-semibold text-sm text-text-primary mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Workflow;
