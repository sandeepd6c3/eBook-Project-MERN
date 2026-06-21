import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Articles = () => {
  const articlesList = [
    {
      title: "How to Structure a Bestselling Book Outline with AI",
      category: "Writing Guides",
      date: "June 18, 2026",
      desc: "Learn how the Structuring Engine selects target marketing angles and builds outlines that convert readers.",
      image: "bg-gradient-to-tr from-cyan-100 to-blue-100",
    },
    {
      title: "Asynchronous Chunking: How We Bypass Context Limits",
      category: "Technology",
      date: "June 15, 2026",
      desc: "An in-depth explanation of sequential chapter drafting loops that prevent text truncation and context loss.",
      image: "bg-gradient-to-tr from-purple-100 to-indigo-100",
    },
    {
      title: "Style Locking: Designing Coherent Book Cover & Plate Art",
      category: "Design Tips",
      date: "June 10, 2026",
      desc: "How appending locked prompts to Imagen 3 builds unified illustration plates that maintain artistic consistency.",
      image: "bg-gradient-to-tr from-rose-100 to-orange-100",
    },
  ];

  return (
    <section className="py-24 bg-bg-primary border-b border-border-primary transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header containing title and outline button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div className="text-left">
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-text-primary mb-2">
              News & Articles
            </h2>
            <p className="text-text-secondary text-xs">
              Stay updated with publishing news, writing methodologies, and system updates.
            </p>
          </div>
          <Link to="/signup" className="self-start sm:self-auto">
            <Button variant="secondary" className="text-[10px] font-bold tracking-widest px-6 py-2.5">
              More News
            </Button>
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articlesList.map((art, index) => (
            <div key={index} className="flex flex-col text-left group">
              
              {/* Visual Cover Panel */}
              <div className={`w-full aspect-video ${art.image} mb-6 border border-border-primary hover:opacity-95 transition-opacity duration-300 relative overflow-hidden rounded-[2px] flex items-center justify-center`}>
                <span className="font-display font-bold text-text-muted/40 text-lg uppercase tracking-wider">
                  {art.category}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
                <span className="text-brand-purple">{art.category}</span>
                <span>•</span>
                <span>{art.date}</span>
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-text-primary text-base mb-2 group-hover:text-brand-blue transition-colors duration-200 leading-snug">
                {art.title}
              </h3>

              {/* Description */}
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                {art.desc}
              </p>

              {/* Link */}
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-text-primary group-hover:text-brand-blue transition-colors duration-200"
              >
                Read More ➔
              </Link>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Articles;
