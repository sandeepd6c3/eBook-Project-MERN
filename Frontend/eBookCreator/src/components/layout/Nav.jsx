import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../ui/Button";
import ThemeSwitcher from "../ui/ThemeSwitcher";

const Nav = () => {
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Set active section based on hash on initial load
    if (location.pathname === "/") {
      const hash = location.hash.replace("#", "");
      if (["features", "workflow", "faq"].includes(hash)) {
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

    const sections = ["features", "workflow", "faq"];

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px", // Trigger when section is in middle of viewport
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const scrollPos = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      
      // Fallback: If user has scrolled to the bottom of the page, activate faq
      if (scrollPos >= totalHeight - 50) {
        setActiveSection("faq");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Clear hash in URL without triggering popstate/reload
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
      setActiveSection("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-primary border-b border-border-primary shadow-xs transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Branding Logo */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-md shadow-brand-purple/10">
            <svg className="w-5 h-5 text-white stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18.477s-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-text-primary">
            eBook<span className="text-brand-purple">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
          <a
            href="/#features"
            className={`transition-all duration-200 border-b-2 pb-1 ${
              activeSection === "features"
                ? "text-brand-purple border-brand-purple font-extrabold"
                : "text-text-secondary border-transparent hover:text-brand-purple hover:border-brand-purple/30"
            }`}
          >
            Features
          </a>
          <a
            href="/#workflow"
            className={`transition-all duration-200 border-b-2 pb-1 ${
              activeSection === "workflow"
                ? "text-brand-purple border-brand-purple font-extrabold"
                : "text-text-secondary border-transparent hover:text-brand-purple hover:border-brand-purple/30"
            }`}
          >
            Workflow
          </a>
          <a
            href="/#faq"
            className={`transition-all duration-200 border-b-2 pb-1 ${
              activeSection === "faq"
                ? "text-brand-purple border-brand-purple font-extrabold"
                : "text-text-secondary border-transparent hover:text-brand-purple hover:border-brand-purple/30"
            }`}
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher className="hidden sm:flex" />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="text" className="text-xs font-bold tracking-wider">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-xs font-bold tracking-wider py-2 px-4">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Nav;
