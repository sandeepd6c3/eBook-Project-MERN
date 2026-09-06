import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Showcase = () => {
  const showcaseBooks = [
    {
      title: "The Solopreneur AI Playbook",
      author: "Alex Morgan",
      genre: "Business & Tech",
      pages: "148 Pages",
      rating: "4.9",
      gradient: "from-blue-600 via-indigo-700 to-slate-900",
      accent: "bg-blue-500",
      description: "A complete tactical guide on leveraging AI agents, automation pipelines, and async architectures for modern single-person businesses.",
    },
    {
      title: "Mindful Stoicism in the Digital Age",
      author: "Elena Vance",
      genre: "Self-Development",
      pages: "112 Pages",
      rating: "5.0",
      gradient: "from-emerald-700 via-teal-800 to-slate-900",
      accent: "bg-emerald-500",
      description: "Ancient philosophy principles applied to screen-time management, modern deep work focus, and cognitive tranquility.",
    },
    {
      title: "Cloud Native Architecture 2026",
      author: "Devon Chen",
      genre: "Engineering",
      pages: "220 Pages",
      rating: "4.8",
      gradient: "from-purple-700 via-violet-800 to-slate-900",
      accent: "bg-purple-500",
      description: "Best practices for microservices, event-driven streaming pipelines, distributed databases, and serverless deployments.",
    },
  ];

  return (
    <section className="py-24 bg-bg-primary border-b border-border-primary transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div className="text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-full">
              Sample Books Created
            </span>
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-text-primary mt-4 mb-2">
              Explore What Authors Are Publishing
            </h2>
            <p className="text-text-secondary text-sm">
              Discover real-world formatting, cover aesthetics, and structured chapters produced on eBookAI.
            </p>
          </div>
          <Link to="/signup" className="self-start sm:self-auto">
            <Button variant="secondary" className="text-xs font-bold tracking-wider px-6 py-3 rounded-xl">
              Create Your Book ➔
            </Button>
          </Link>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcaseBooks.map((book, index) => (
            <div 
              key={index}
              className="bg-bg-secondary rounded-2xl border border-border-primary p-6 flex flex-col justify-between hover:border-brand-purple/40 hover:shadow-xl transition-all duration-300 group text-left"
            >
              <div>
                {/* 3D-styled Book Cover Preview */}
                <div className={`w-full aspect-[4/3] rounded-xl bg-gradient-to-br ${book.gradient} p-6 flex flex-col justify-between text-white shadow-md relative overflow-hidden mb-6 group-hover:scale-[1.02] transition-transform duration-300`}>
                  <div className="flex items-center justify-between text-[9px] font-mono tracking-widest uppercase opacity-80">
                    <span>{book.genre}</span>
                    <span>★ {book.rating}</span>
                  </div>
                  <div>
                    <div className={`h-1 w-8 ${book.accent} rounded mb-2`}></div>
                    <h3 className="font-display font-bold text-lg sm:text-xl leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-[10px] opacity-80 mt-1 font-sans">by {book.author}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] opacity-75 border-t border-white/15 pt-2">
                    <span>{book.pages}</span>
                    <span>PDF • EPUB • DOCX</span>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                    {book.genre}
                  </span>
                  <span className="text-text-muted text-xs">•</span>
                  <span className="text-[10px] font-medium text-text-muted">
                    {book.pages}
                  </span>
                </div>

                <h3 className="font-display font-bold text-text-primary text-base mb-2 group-hover:text-brand-purple transition-colors">
                  {book.title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  {book.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border-primary/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-muted">By {book.author}</span>
                <Link 
                  to="/signup"
                  className="text-xs font-bold text-brand-purple group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                >
                  Generate Similar ➔
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Showcase;
