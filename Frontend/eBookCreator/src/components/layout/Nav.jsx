import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeSwitcher from "../ui/ThemeSwitcher";

const Nav = () => {
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const hash = location.hash.replace("#", "");
      if (["features", "workflow", "preview", "use-cases", "faq"].includes(hash)) {
        setActiveSection(hash);
      }
    } else {
      setActiveSection("");
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sections = ["features", "workflow", "preview", "use-cases", "faq"];

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -30% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
      setActiveSection("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-md border-b border-border-primary transition-colors duration-250">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Simple, refined SaaS Logo */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-text-primary text-bg-primary flex items-center justify-center font-serif font-bold text-base shadow-xs">
            e
          </div>
          <span className="font-sans font-semibold text-base tracking-tight text-text-primary">
            eBook<span className="text-brand-purple">AI</span>
          </span>
        </Link>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-text-secondary">
          <a
            href="/#features"
            className={`transition-colors py-1 ${
              activeSection === "features"
                ? "text-text-primary font-semibold"
                : "hover:text-text-primary"
            }`}
          >
            Features
          </a>
          <a
            href="/#workflow"
            className={`transition-colors py-1 ${
              activeSection === "workflow"
                ? "text-text-primary font-semibold"
                : "hover:text-text-primary"
            }`}
          >
            Workflow
          </a>
          <a
            href="/#preview"
            className={`transition-colors py-1 ${
              activeSection === "preview"
                ? "text-text-primary font-semibold"
                : "hover:text-text-primary"
            }`}
          >
            Product
          </a>
          <a
            href="/#use-cases"
            className={`transition-colors py-1 ${
              activeSection === "use-cases"
                ? "text-text-primary font-semibold"
                : "hover:text-text-primary"
            }`}
          >
            Use Cases
          </a>
          <a
            href="/#faq"
            className={`transition-colors py-1 ${
              activeSection === "faq"
                ? "text-text-primary font-semibold"
                : "hover:text-text-primary"
            }`}
          >
            FAQ
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher className="hidden sm:flex" />
          <Link
            to="/login"
            className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-xs font-semibold bg-text-primary text-bg-primary px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-xs"
          >
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Nav;
