import React, { useState } from "react";

const faqData = [
  {
    question: "How does the AI writing assistance work?",
    answer: "You can use AI at multiple levels: generate an entire structured book outline, draft individual chapters with comprehensive educational sections (examples, exercises, summaries), or highlight specific paragraphs in the editor to rewrite, simplify, or fix grammar. All AI edits offer non-destructive change previews before modifying your content.",
  },
  {
    question: "Do I retain full copyright and commercial publishing rights?",
    answer: "Yes. You retain 100% ownership and copyright of any book, chapter, or content created using eBookAI. You can freely sell your books on Amazon Kindle Direct Publishing (KDP), Gumroad, your own website, or distribute them as lead magnets.",
  },
  {
    question: "What formats can I export my finished book to?",
    answer: "You can download high-fidelity PDF files (complete with custom cover pages, automatic table of contents, running headers, and page breaks), editable Microsoft Word (.docx) files, and standardized EPUB (.epub) files compatible with e-readers.",
  },
  {
    question: "Can I customize the cover and layout styles?",
    answer: "Yes. The editor includes a Cover Studio where you can choose typography themes, color palettes, or generate custom background art. You can also customize page margins, font sizes, alignments, and chapter breaks in the Export Settings builder.",
  },
  {
    question: "Is there reliable autosave and version history?",
    answer: "Yes. Every change you make in the editor is automatically saved to the database. Additionally, each AI modification creates a version revision in your history so you can review previous versions or restore them at any time.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-bg-primary border-b border-border-primary scroll-mt-16 transition-colors duration-250">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
            Common questions about eBookAI
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Everything you need to know about rights, formats, AI controls, and publishing.
          </p>
        </div>

        {/* Clean Accordion */}
        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className="bg-bg-secondary border border-border-primary rounded-xl transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none"
                >
                  <span className="text-sm font-semibold text-text-primary">
                    {item.question}
                  </span>
                  <span className="text-text-muted text-base ml-4 font-mono">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-border-primary/60 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
