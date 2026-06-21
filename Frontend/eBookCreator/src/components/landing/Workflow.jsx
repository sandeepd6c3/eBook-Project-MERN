import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Workflow = () => {
  const workflowSteps = [
    {
      num: "01",
      label: "Topic & Persona",
      desc: "Define niche & marketing persona",
    },
    {
      num: "02",
      label: "AI Outline",
      desc: "Structure outline & chapters",
    },
    {
      num: "03",
      label: "Drafting Loop",
      desc: "Iterative context-aware writing",
    },
    {
      num: "04",
      label: "PDF Compiler",
      desc: "Auto-paginate, style & export",
    },
  ];

  return (
    <section id="workflow" className="relative py-20 bg-bg-secondary border-t border-b border-border-primary overflow-hidden scroll-mt-20 transition-colors duration-250">
      {/* Soft abstract watercolor/gradient splash background similar to screenshot */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-purple/5 blur-[80px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue/5 blur-[70px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        
        <h2 className="font-display font-normal text-3xl sm:text-4xl text-text-primary mb-4">
          Automated Book Generation Flow
        </h2>
        <p className="text-text-secondary text-sm mb-12">
          Watch your ebook transform from a simple idea into a fully formatted book.
        </p>

        {/* Circular Countdown/Workflow Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-center items-center mb-12 max-w-4xl mx-auto">
          {workflowSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              
              {/* Large Circle Node */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-border-primary flex flex-col justify-center items-center bg-bg-primary shadow-sm hover:border-text-primary transition-colors duration-300">
                <span className="font-display font-bold text-2xl sm:text-3xl text-text-primary leading-none">
                  {step.num}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-text-muted font-mono mt-1">
                  Stage
                </span>
              </div>

              {/* Labels below */}
              <h4 className="font-display font-bold text-text-primary text-sm mt-4 mb-1">
                {step.label}
              </h4>
              <p className="text-xs text-text-muted max-w-[150px] leading-relaxed">
                {step.desc}
              </p>

            </div>
          ))}
        </div>

        {/* Buttons below timeline */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/signup">
            <Button variant="secondary" className="px-6 py-2.5 text-xs font-bold tracking-wider">
              Launch Creator
            </Button>
          </Link>
          <a href="#features" className="text-xs font-bold tracking-wider uppercase text-text-secondary hover:text-text-primary py-2.5 px-4 transition-colors">
            Read Docs ➔
          </a>
        </div>

      </div>
    </section>
  );
};

export default Workflow;
