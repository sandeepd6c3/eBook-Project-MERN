import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Hero = () => {
  return (
    <section className="relative bg-[#f5f5f5] overflow-x-hidden pt-[14px] pb-20 md:pt-[46px] md:pb-24 border-b border-slate-100 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      {/* Main Hero Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 w-full mb-16">
        
        {/* Left Column (Content) */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          
          <span className="text-[10px] font-bold tracking-[0.2em] text-brand-blue uppercase mb-4">
            CREATE COMPLETE EBOOKS WITH AI
          </span>
          
          <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-[1.12] tracking-tight mb-8">
            Create <br />
            <span className="text-brand-blue font-semibold italic">Professional eBooks</span> <br />
            From a Single Idea <br />
            In Minutes.
          </h1>
          
          <p className="max-w-xl text-slate-500 text-sm sm:text-base leading-relaxed mb-10">
            Convert a single topic or prompt into a fully formatted, illustrated, and publication-ready digital book automatically.
          </p>

          {/* Action Buttons: Exact two buttons requested */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-8 py-4 text-xs font-bold tracking-wider">
                Create Your eBook
              </Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-xs font-bold tracking-wider">
                ▶ Watch Demo
              </Button>
            </Link>
          </div>

          {/* Emerson Book Quote Card (User customized author name) */}
          <div className="flex items-start gap-4 w-full max-w-md bg-white/50 backdrop-blur-xs p-6 border border-slate-200/60 shadow-sm rounded-[2px]">
            <span className="text-4xl font-serif text-brand-purple/40 leading-none">“</span>
            <div className="-mt-2">
              <p className="font-serif italic text-slate-600 text-sm leading-relaxed">
                Some books leave us free and some books make us free.
              </p>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mt-2 block">
                — Sandeep Choudhary
              </span>
            </div>
          </div>

        </div>

        {/* Right Column (3D Books Illustration Image) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end relative w-full lg:min-h-[600px] items-center">
          <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] xl:h-[600px] max-w-lg lg:max-w-[580px] xl:max-w-[600px] flex items-center justify-center">
            {/* Soft background glow shadow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-slate-900/5 blur-3xl rounded-full -z-10"></div>
            <img 
              src="/premium_kobo_hero.jpg" 
              alt="Kobo e-reader displaying an open book on a notebook" 
              className="w-full h-full object-cover rounded-2xl border border-slate-200/60 shadow-2xl hover:scale-[1.02] hover:-rotate-1 transition-all duration-500 origin-center"
            />
          </div>
        </div>

      </div>

      {/* Social Proof & Metrics Section */}
      <div className="max-w-7xl mx-auto px-6 w-full border-t border-slate-200/60 pt-12 mt-4 relative z-10">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Trusted by <span className="text-brand-purple font-extrabold">10,000+ eBooks Created</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/50 p-5 text-center rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-300">
            <h3 className="font-display font-bold text-slate-800 text-xl sm:text-2xl mb-1">
              95% Faster
            </h3>
            <p className="text-xs text-slate-500">Writing & Drafting Cycles</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/50 p-5 text-center rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-300">
            <h3 className="font-display font-bold text-slate-800 text-xl sm:text-2xl mb-1">
              50+ Categories
            </h3>
            <p className="text-xs text-slate-500">Niches & Topics Supported</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/50 p-5 text-center rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-300">
            <h3 className="font-display font-bold text-slate-800 text-xl sm:text-2xl mb-1">
              PDF & EPUB
            </h3>
            <p className="text-xs text-slate-500">High-Resolution Document Export</p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
