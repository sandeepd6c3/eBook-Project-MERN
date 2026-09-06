import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const containerRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 4; // subtle 4deg tilt
    const rotateY = ((x - centerX) / centerX) * 4;

    setTiltStyle(
      `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`
    );
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle("perspective(1200px) rotateX(2deg) rotateY(0deg) translateZ(0px)");
  };

  return (
    <section className="relative bg-bg-primary pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border-primary overflow-hidden transition-colors duration-250">
      
      {/* Subtle Floating Paper / Particle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
        <div 
          className="absolute top-16 left-[10%] w-24 h-32 rounded-lg bg-border-primary/25 border border-border-primary/30 rotate-12 animate-float-gentle opacity-40 blur-[0.5px]"
          style={{ animationDuration: "8s" }}
        />
        <div 
          className="absolute top-48 right-[12%] w-28 h-36 rounded-lg bg-brand-purple/[0.04] border border-brand-purple/10 -rotate-6 animate-float-gentle opacity-50 blur-[0.5px]"
          style={{ animationDuration: "10s", animationDelay: "1s" }}
        />
        <div 
          className="absolute bottom-20 left-[18%] w-16 h-20 rounded-md bg-border-primary/20 border border-border-primary/30 -rotate-12 animate-float-gentle opacity-30"
          style={{ animationDuration: "7s", animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
        
        {/* Subtle Category Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-secondary border border-border-primary text-text-secondary text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Intelligent Book Authoring & Publishing Platform
        </div>

        {/* Clear, Confident Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-primary tracking-tight max-w-3xl leading-[1.12] mb-6">
          Write, edit, and publish complete books with AI assistance.
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl text-text-secondary text-base sm:text-lg leading-relaxed mb-8">
          Turn your ideas, outlines, or knowledge into structured, beautifully formatted digital books. Complete with real-time editing, cover design, and multi-format exports.
        </p>

        {/* Intentional CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-text-primary text-bg-primary text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm text-center"
          >
            Create your eBook
          </Link>
          <a
            href="#preview"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-bg-secondary border border-border-primary text-text-primary text-xs sm:text-sm font-medium hover:bg-bg-tertiary transition-colors text-center"
          >
            See how it works ↓
          </a>
        </div>

        {/* 3D Realistic Interactive Product Preview with 3D Book & Parallax */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: tiltStyle || "perspective(1200px) rotateX(2deg) rotateY(0deg)",
            transition: isHovered ? "transform 0.15s ease-out" : "transform 0.7s ease-out",
            transformStyle: "preserve-3d",
          }}
          className="w-full max-w-5xl rounded-xl border border-border-primary bg-bg-secondary shadow-2xl overflow-hidden text-left"
        >
          
          {/* Editor Window Bar */}
          <div className="px-4 py-3 bg-bg-primary border-b border-border-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border-primary"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-border-primary"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-border-primary"></div>
              </div>
              <span className="text-[11px] text-text-muted font-medium ml-2">
                eBookStudio — Mastering Cloud Architecture.epub
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Saved ✓</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-bg-secondary border border-border-primary text-text-secondary">
                PDF / EPUB / DOCX
              </span>
            </div>
          </div>

          {/* Realistic 3-Column Interface Preview with 3D Depth */}
          <div className="grid grid-cols-12 min-h-[400px] bg-bg-primary divide-x divide-border-primary">
            
            {/* Column 1: Left Table of Contents & 3D Mini Book Cover */}
            <div className="hidden md:block md:col-span-3 p-4 bg-bg-secondary/50 space-y-4">
              
              {/* 3D Mini Book Cover Card */}
              <div className="p-3 rounded-xl bg-bg-primary border border-border-primary shadow-sm flex items-center gap-3 group">
                <div 
                  className="w-12 h-16 rounded-r bg-gradient-to-tr from-indigo-900 via-purple-900 to-slate-900 text-white p-1.5 flex flex-col justify-between shadow-md border-l-2 border-black/40 group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300 shrink-0"
                >
                  <div className="text-[5px] uppercase font-mono opacity-70">VOL 01</div>
                  <div className="text-[7px] font-bold leading-none">Cloud Arch</div>
                  <div className="text-[5px] opacity-60 font-mono">2026</div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">Cloud Architecture</div>
                  <div className="text-[10px] text-text-muted">Alex Morgan</div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-border-primary">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Chapters</span>
                <span className="text-[11px] text-text-muted font-mono">1,840 words</span>
              </div>

              {/* Interactive Hovering Chapter Items */}
              <div className="space-y-1 text-xs">
                <div className="p-2 rounded-md bg-bg-primary border border-border-primary font-medium text-text-primary shadow-xs flex items-center justify-between hover:translate-x-1 transition-transform">
                  <span className="truncate">01. Distributed Systems</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="p-2 rounded-md hover:bg-bg-primary text-text-secondary transition-all hover:translate-x-1 truncate">
                  02. Event-Driven Messaging
                </div>
                <div className="p-2 rounded-md hover:bg-bg-primary text-text-secondary transition-all hover:translate-x-1 truncate">
                  03. High Availability Patterns
                </div>
                <div className="p-2 rounded-md hover:bg-bg-primary text-text-secondary transition-all hover:translate-x-1 truncate">
                  04. Cloud Deployment
                </div>
              </div>
            </div>

            {/* Column 2: Center Editor Canvas */}
            <div className="col-span-12 md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-bg-primary">
              <div className="space-y-3">
                {/* Formatting bar mockup */}
                <div className="flex items-center gap-2 pb-3 border-b border-border-primary text-text-muted text-xs">
                  <span className="font-bold text-text-primary">H1</span>
                  <span className="font-bold text-text-primary">H2</span>
                  <span>B</span>
                  <span className="italic">I</span>
                  <span>Code</span>
                  <span>Quote</span>
                  <span>List</span>
                </div>

                <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
                  Chapter 1: Principles of Distributed Resiliency
                </h2>
                
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Building fault-tolerant software at scale requires decoupling stateful services from real-time computational workloads. In modern cloud architecture, failure is an inevitable operating condition rather than an edge case.
                </p>

                <div className="p-3 rounded-lg bg-bg-secondary border border-border-primary text-xs font-mono text-text-secondary">
                  // Event circuit breaker configuration<br/>
                  const breaker = new CircuitBreaker(fetchUserData, options);
                </div>
              </div>

              <div className="pt-4 border-t border-border-primary flex items-center justify-between text-[11px] text-text-muted">
                <span>Page 1 of 18</span>
                <span>Reading time: ~4 min</span>
              </div>
            </div>

            {/* Column 3: Right AI Assistant */}
            <div className="hidden md:block md:col-span-3 p-4 bg-bg-secondary/50 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-border-primary text-xs font-semibold text-text-primary">
                <span>✨</span>
                <span>AI Writing Assistant</span>
              </div>

              <div className="p-2.5 rounded-lg bg-bg-primary border border-border-primary space-y-1.5 text-xs shadow-xs">
                <span className="text-[10px] font-bold uppercase text-text-muted">Applied Instruction:</span>
                <p className="text-text-primary text-[11px] italic">"Add real-world failure scenario example..."</p>
                <div className="pt-1 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                    Accepted ✓
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <span className="text-text-muted font-medium">Quick Actions:</span>
                <div className="p-1.5 rounded bg-bg-primary border border-border-primary text-text-secondary hover:text-text-primary hover:border-brand-purple/30 cursor-pointer transition-all">
                  Add 3 Practice Exercises
                </div>
                <div className="p-1.5 rounded bg-bg-primary border border-border-primary text-text-secondary hover:text-text-primary hover:border-brand-purple/30 cursor-pointer transition-all">
                  Simplify for Beginners
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
