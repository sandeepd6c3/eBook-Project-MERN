import React from "react";
import InteractiveTilt from "../ui/InteractiveTilt";

const UseCases = () => {
  const cases = [
    {
      title: "Technical Books & Documentation",
      description: "Structure complex programming concepts, code blocks, syntax patterns, and hands-on architecture exercises.",
      tag: "Engineering",
    },
    {
      title: "Study Guides & Course Material",
      description: "Create structured learning modules complete with chapter summaries, self-assessment MCQs, and key takeaways.",
      tag: "Education",
    },
    {
      title: "Business & Tactical Playbooks",
      description: "Compile industry methodologies, case studies, frameworks, and lead magnet ebooks for client acquisition.",
      tag: "Business",
    },
    {
      title: "Tutorials & Step-by-Step Guides",
      description: "Produce actionable walk-throughs and workflows that guide readers through specific problem-solving scenarios.",
      tag: "How-To Guides",
    },
    {
      title: "Non-Fiction & Self-Development",
      description: "Write engaging personal development, philosophy, productivity, or lifestyle guides with consistent tone.",
      tag: "Non-Fiction",
    },
    {
      title: "Fiction & Creative Stories",
      description: "Draft narratives with consistent character arcs, rich world-building, and custom digital cover designs.",
      tag: "Creative",
    },
  ];

  return (
    <section id="use-cases" className="py-20 bg-bg-secondary border-b border-border-primary scroll-mt-16 transition-colors duration-250">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
            Versatile Publishing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
            Built for writers, students, and creators.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Whether you are documenting technical systems, building an online course, or publishing your first book, eBookAI adapts to your workflow.
          </p>
        </div>

        {/* Use Cases Grid with subtle tilt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((item, index) => (
            <InteractiveTilt
              key={index}
              maxTilt={3}
              scale={1.01}
              className="h-full"
            >
              <div className="h-full p-6 rounded-xl bg-bg-primary border border-border-primary shadow-xs hover:border-text-muted transition-colors flex flex-col justify-between text-left">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded mb-3 inline-block">
                    {item.tag}
                  </span>
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

export default UseCases;
