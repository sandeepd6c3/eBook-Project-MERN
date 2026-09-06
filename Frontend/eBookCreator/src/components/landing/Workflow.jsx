import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Workflow = () => {
  const steps = [
    {
      step: "01",
      title: "Input Topic & Audience",
      desc: "Specify your book subject, genre, and target audience tone. Our AI formulates the core narrative hooks.",
      tag: "Ideation",
    },
    {
      step: "02",
      title: "Generate Structured Outline",
      desc: "Review and customize auto-generated chapters, sub-headings, and key talking points before writing.",
      tag: "Planning",
    },
    {
      step: "03",
      title: "AI Writes Full Chapters",
      desc: "Watch as our context-aware drafting loop creates rich, structured prose chapter-by-chapter in real-time.",
      tag: "Writing",
    },
    {
      step: "04",
      title: "Customize & Export",
      desc: "Design your custom book cover and download publication-ready files in PDF, EPUB, DOCX, or Markdown.",
      tag: "Publishing",
    },
  ];

  return (
    <section id="workflow" className="relative py-24 bg-bg-secondary border-t border-b border-border-primary overflow-hidden scroll-mt-20 transition-colors duration-250">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-purple/5 blur-[90px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-brand-blue/5 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-3.5 py-1.5 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-text-primary mt-4 mb-3">
            How It Works
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            From initial concept to full digital publication in 4 straightforward stages.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((item, index) => (
            <div 
              key={index}
              className="bg-bg-primary rounded-2xl border border-border-primary p-7 flex flex-col justify-between text-left relative group hover:border-brand-blue/40 hover:shadow-lg transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-brand-purple to-brand-blue">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-md">
                    {item.tag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-text-primary mb-2 group-hover:text-brand-blue transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border-primary/60 flex items-center gap-1.5 text-[11px] font-bold text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Automated Workflow</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button variant="primary" className="px-8 py-3.5 text-xs font-bold tracking-wider rounded-xl shadow-md">
              Start Writing Now ➔
            </Button>
          </Link>
          <a 
            href="#faq" 
            className="px-6 py-3.5 text-xs font-bold tracking-wider uppercase text-text-secondary hover:text-text-primary rounded-xl border border-border-primary bg-bg-primary hover:bg-bg-tertiary transition-all"
          >
            Read FAQs
          </a>
        </div>

      </div>
    </section>
  );
};

export default Workflow;
