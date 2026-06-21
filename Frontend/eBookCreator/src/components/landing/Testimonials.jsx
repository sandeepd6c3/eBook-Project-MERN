import React from "react";

const Testimonials = () => {
  const reviews = [
    {
      text: "The asynchronous chunking is a game-changer. I generated a full 12-chapter textbook on Rust programming in under 10 minutes.",
      stars: 5,
      name: "Audrey Stevenson",
      role: "Technical Author",
    },
    {
      text: "Visual consistency was always my bottleneck with AI illustrators. Style locking solves it perfectly. All chapter plates match my theme.",
      stars: 5,
      name: "Fred Rodriguez",
      role: "Fiction Writer",
    },
    {
      text: "Auto-pagination and layout margins worked flawlessly. Exporting directly to PDF saved me hours of manual formatting in Word.",
      stars: 5,
      name: "Laura Ferguson",
      role: "Content Marketer",
    },
    {
      text: "The semantic anchor tracking prevented the AI from repeating itself across chapters. The narrative flows like a human wrote it.",
      stars: 5,
      name: "Bennett Miller",
      role: "Self-Publisher",
    },
  ];

  return (
    <section className="py-24 bg-bg-primary border-b border-border-primary relative transition-colors duration-250">
      {/* Soft abstract watercolor gradient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-3/5 bg-brand-purple/3 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        
        <h2 className="font-display font-normal text-3xl sm:text-4xl text-text-primary mb-2">
          What Our Writers Say
        </h2>
        <p className="text-text-secondary text-xs mb-16">
          Read reviews from authors, marketers, and developers automating ebook publishing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviews.map((rev, index) => (
            <div key={index} className="border border-border-primary bg-bg-secondary p-6 relative flex flex-col justify-between items-center rounded-[2px] shadow-sm hover:shadow-md transition-shadow duration-300">
              
              {/* Double Quotes Icon at the top */}
              <div className="text-5xl font-serif text-brand-purple/20 select-none leading-none -mt-4 mb-2">
                ””
              </div>

              {/* Review Text */}
              <p className="text-xs text-text-secondary leading-relaxed italic text-center mb-6 min-h-[72px]">
                "{rev.text}"
              </p>

              {/* Star Rating & Author info */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-0.5 text-xs text-amber-400 mb-4">
                  {"★".repeat(rev.stars)}
                </div>
                
                {/* Custom Avatar with initials */}
                <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center font-bold text-xs text-text-primary mb-3 border border-border-primary">
                  {rev.name.split(" ").map(n => n[0]).join("")}
                </div>

                <h4 className="text-xs font-bold text-text-primary">{rev.name}</h4>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider mt-0.5">{rev.role}</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
