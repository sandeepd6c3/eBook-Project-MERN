import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "cream" || saved === "dark") {
      return saved;
    }
    return "light"; // default theme
  });

  const setTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "cream" || newTheme === "dark") {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove existing theme classes
    root.classList.remove("theme-light", "theme-cream", "theme-dark");
    // Add the current theme class
    root.classList.add(`theme-${theme}`);
    
    // Also apply to body for scrollbar/outer background matching
    const body = document.body;
    body.classList.remove("theme-light", "theme-cream", "theme-dark");
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
