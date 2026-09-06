import React from "react";
import { Link } from "react-router-dom";

const Testimonials = () => {
  const reviews = [
    {
      text: "I generated a complete 10-chapter technical handbook in under 15 minutes. The chapter coherence and clean formatting were unbelievable.",
      stars: 5,
      name: "Marcus Vance",
      role: "Engineering Lead & Author",
    },
    {
      text: "The cover designer and PDF export saved me hundreds of dollars on freelance formatting. My book was ready for Amazon Kindle right away.",
      stars: 5,
      name: "Sophia Martinez",
      role: "Digital Publisher",
    },
    {
      text: "The fact that all AI features, outlines, and multi-format exports are completely free without paywalls makes this an indispensable tool.",
      stars: 5,
      name: "Liam O'Connor",
      role: "Content Creator",
    },
  ];

  return (
    <section className="py-24 bg-bg-secondary border-b border-border-primary relative transition-colors duration-250">
      {/* Soft ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-3/5 bg-brand-purple/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3.5 py-1.5 rounded-full">
            Trusted by Creators
          </span>
          <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-text-primary mt-4 mb-3">
            Loved by Authors & Publishers
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            See how writers, educators, and solopreneurs use eBookAI to publish faster.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, index) => (
            <div 
              key={index} 
              className="border border-border-primary bg-bg-primary p-7 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-5">
                  {"★".repeat(rev.stars)}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6 italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-border-primary/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
                  {rev.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary">{rev.name}</h4>
                  <span className="text-[10px] text-text-muted">{rev.role}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
