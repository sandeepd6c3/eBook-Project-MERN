import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  return (
    <footer className="bg-bg-secondary border-t border-border-primary transition-colors duration-250">
      
      {/* 1. Final Call-to-Action Section */}
      <section className="py-20 bg-bg-primary border-b border-border-primary text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight mb-4">
            Start writing your book today.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Create an account in seconds. Plan your structure, draft in-depth chapters, and export publication-ready documents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-text-primary text-bg-primary text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Create your eBook Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-bg-secondary border border-border-primary text-text-primary text-xs sm:text-sm font-medium hover:bg-bg-tertiary transition-colors"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main Footer Navigation */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col items-start">
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-text-primary text-bg-primary flex items-center justify-center font-serif font-bold text-sm">
              e
            </div>
            <span className="font-sans font-semibold text-base tracking-tight text-text-primary">
              eBook<span className="text-brand-purple">AI</span>
            </span>
          </Link>
          <p className="text-xs text-text-secondary leading-relaxed max-w-xs mb-4">
            A modern, thoughtful platform for writing, editing, and publishing digital books with intelligent AI assistance.
          </p>
        </div>

        {/* Links Grid */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><a href="#features" className="hover:text-text-primary transition-colors">Features</a></li>
              <li><a href="#workflow" className="hover:text-text-primary transition-colors">Workflow</a></li>
              <li><a href="#preview" className="hover:text-text-primary transition-colors">Product Studio</a></li>
              <li><a href="#use-cases" className="hover:text-text-primary transition-colors">Use Cases</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Formats
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><a href="#features" className="hover:text-text-primary transition-colors">PDF Export</a></li>
              <li><a href="#features" className="hover:text-text-primary transition-colors">EPUB for Kindle</a></li>
              <li><a href="#features" className="hover:text-text-primary transition-colors">Microsoft Word</a></li>
              <li><a href="#features" className="hover:text-text-primary transition-colors">Cover Studio</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><Link to="/login" className="hover:text-text-primary transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-text-primary transition-colors">Get Started</Link></li>
              <li><Link to="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</Link></li>
              <li><a href="#faq" className="hover:text-text-primary transition-colors">Help & FAQ</a></li>
            </ul>
          </div>
        </div>

      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="border-t border-border-primary py-6 bg-bg-primary/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} eBookAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#faq" className="hover:text-text-primary transition-colors">Privacy</a>
            <span>•</span>
            <a href="#faq" className="hover:text-text-primary transition-colors">Terms</a>
            <span>•</span>
            <a href="#faq" className="hover:text-text-primary transition-colors">Contact</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
