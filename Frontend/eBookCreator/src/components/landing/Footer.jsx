import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Footer = () => {
  return (
    <footer className="mt-auto bg-[#f9fafb] border-t border-slate-100">
      
      {/* 1. Newsletter Subscribe Section */}
      <section className="py-16 bg-white border-b border-slate-100 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display font-normal text-2xl sm:text-3xl text-slate-900 mb-2">
            Subscribe For Free Access
          </h2>
          <p className="text-slate-500 text-xs mb-8 max-w-sm mx-auto leading-relaxed">
            Join our mailing list to receive product updates, layout templates, and free AI credits.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your Email" 
              className="flex-grow border border-slate-200 px-4 py-3 text-xs rounded-none focus:outline-none focus:border-slate-900 text-slate-800 bg-slate-50"
              required
            />
            <Button type="submit" variant="primary" className="text-[10px] tracking-widest font-bold py-3 px-6 rounded-none">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* 2. Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Left branding details */}
        <div className="md:col-span-4 flex flex-col items-start text-left">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center">
              <svg className="w-4 h-4 text-white stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18.477s-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-900">
              eBook<span className="text-brand-purple">AI</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
            An automated AI content generation pipeline converting raw ideas into fully written, illustrated, styled, and publication-ready digital books.
          </p>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">
            HEADQUARTERS // IND, GGN
          </span>
        </div>

        {/* Right columns */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
          {/* Column 1 */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-800 tracking-widest uppercase mb-4">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#features" className="hover:text-brand-blue transition-colors">AI Outlining</a></li>
              <li><a href="#workflow" className="hover:text-brand-blue transition-colors">Drafting Engine</a></li>
              <li><a href="#tech" className="hover:text-brand-blue transition-colors">Style Locking</a></li>
              <li><Link to="/signup" className="hover:text-brand-blue transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-800 tracking-widest uppercase mb-4">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#workflow" className="hover:text-brand-blue transition-colors">Documentation</a></li>
              <li><a href="#features" className="hover:text-brand-blue transition-colors">Gemini API</a></li>
              <li><a href="#tech" className="hover:text-brand-blue transition-colors">Imagen Prompts</a></li>
              <li><a href="#workflow" className="hover:text-brand-blue transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-800 tracking-widest uppercase mb-4">Company</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#workflow" className="hover:text-brand-blue transition-colors">About Us</a></li>
              <li><a href="#features" className="hover:text-brand-blue transition-colors">Careers</a></li>
              <li><a href="#tech" className="hover:text-brand-blue transition-colors">Office</a></li>
              <li><a href="#workflow" className="hover:text-brand-blue transition-colors">Press Kit</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-800 tracking-widest uppercase mb-4">Support</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/login" className="hover:text-brand-blue transition-colors">Privacy Policy</Link></li>
              <li><Link to="/login" className="hover:text-brand-blue transition-colors">Disclaimer</Link></li>
              <li><Link to="/login" className="hover:text-brand-blue transition-colors">FAQ</Link></li>
              <li><Link to="/login" className="hover:text-brand-blue transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

      </div>

      {/* 3. Bottom copyright bar */}
      <div className="border-t border-slate-100 bg-[#f3f4f6]/50 py-6 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400">
            Copyright © 2026 eBookAI. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <a href="#features" className="hover:text-brand-blue transition-colors">Facebook</a>
            <span>•</span>
            <a href="#features" className="hover:text-brand-blue transition-colors">Twitter</a>
            <span>•</span>
            <a href="#features" className="hover:text-brand-blue transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
