import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Hero = () => {
  return (
    <section className="relative bg-bg-secondary overflow-x-hidden pt-[14px] pb-20 md:pt-[46px] md:pb-24 border-b border-border-primary flex flex-col transition-colors duration-250">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      {/* Main Hero Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 w-full mb-16">
        
        {/* Left Column (Content) */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          
          <span className="text-[10px] font-bold tracking-[0.2em] text-brand-blue uppercase mb-4">
            CREATE COMPLETE EBOOKS WITH AI
          </span>
          
          <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-[1.12] tracking-tight mb-8">
            Create <br />
            <span className="text-brand-blue font-semibold italic">Professional eBooks</span> <br />
            From a Single Idea <br />
            In Minutes.
          </h1>
          
          <p className="max-w-xl text-text-secondary text-sm sm:text-base leading-relaxed mb-10">
            Convert a single topic or prompt into a fully formatted, illustrated, and publication-ready digital book automatically.
          </p>

          {/* Action Area (Buttons & Stats with unified width) */}
          <div className="w-full max-w-lg flex flex-col items-start gap-8 mb-12">
            
            {/* Action Buttons: Equal size rows matching stats width */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Link to="/signup" className="w-full sm:w-auto flex-1">
                <Button variant="primary" className="w-full px-6 py-4 text-xs font-bold tracking-wider">
                  Create Your eBook
                </Button>
              </Link>
              <Link to="/signup" className="w-full sm:w-auto flex-1">
                <Button variant="secondary" className="w-full px-6 py-4 text-xs font-bold tracking-wider">
                  ▶ Watch Demo
                </Button>
              </Link>
            </div>

            {/* Metrics Section */}
            <div className="w-full border-t border-border-primary pt-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Trusted by <span className="text-text-primary font-extrabold">10,000+ eBooks Created</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
                {/* Stat 1 */}
                <div className="flex flex-col items-start border-l-2 border-border-primary pl-4">
                  <span className="font-display font-bold text-text-primary text-base sm:text-lg tracking-tight leading-none mb-1">
                    95% Faster
                  </span>
                  <span className="text-[10px] sm:text-xs text-text-muted font-medium leading-normal">
                    Writing & Drafting Cycles
                  </span>
                </div>
                
                {/* Stat 2 */}
                <div className="flex flex-col items-start border-l-2 border-border-primary pl-4">
                  <span className="font-display font-bold text-text-primary text-base sm:text-lg tracking-tight leading-none mb-1">
                    50+ Categories
                  </span>
                  <span className="text-[10px] sm:text-xs text-text-muted font-medium leading-normal">
                    Niches & Topics Supported
                  </span>
                </div>
                
                {/* Stat 3 */}
                <div className="flex flex-col items-start border-l-2 border-border-primary pl-4">
                  <span className="font-display font-bold text-text-primary text-base sm:text-lg tracking-tight leading-none mb-1">
                    PDF & EPUB
                  </span>
                  <span className="text-[10px] sm:text-xs text-text-muted font-medium leading-normal">
                    High-Resolution Document Export
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (3D Books Illustration Image) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end relative w-full lg:min-h-[590px] items-center">
          <div className="relative w-full h-[340px] sm:h-[440px] lg:h-[540px] xl:h-[590px] max-w-lg lg:max-w-[580px] xl:max-w-[600px] flex items-center justify-center">
            {/* Soft background glow shadow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-text-primary/5 blur-3xl rounded-full -z-10"></div>
            <img 
              src="/premium_kobo_hero.jpg" 
              alt="Kobo e-reader displaying an open book on a notebook" 
              className="w-full h-full object-cover object-[75%_center] rounded-2xl border border-border-primary shadow-2xl hover:scale-[1.02] hover:-rotate-1 transition-all duration-500 origin-center"
            />
          </div>
        </div>

      </div>

    </section>
  );
};

export default Hero;
