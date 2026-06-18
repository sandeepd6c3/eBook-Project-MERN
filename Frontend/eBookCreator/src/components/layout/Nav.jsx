import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Nav = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-md shadow-brand-purple/10">
            <svg className="w-5 h-5 text-white stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18.477s-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
            eBook<span className="text-brand-purple">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
          <a href="#features" className="hover:text-brand-purple transition-colors duration-200">Features</a>
          <a href="#workflow" className="hover:text-brand-purple transition-colors duration-200">Workflow</a>
          <a href="#tech" className="hover:text-brand-purple transition-colors duration-200">Technology</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="text" className="text-xs font-bold tracking-wider">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" className="text-xs font-bold tracking-wider py-2 px-4">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Nav;
