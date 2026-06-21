import React from "react";
import { useTheme } from "../../context/ThemeContext";

const ThemeSwitcher = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "light",
      name: "Light Theme",
      bgClass: "bg-white",
      // Blue ring for active light theme
      activeRing: "ring-2 ring-offset-2 ring-blue-500 border border-slate-200",
      inactiveBorder: "border border-slate-200 hover:scale-110",
    },
    {
      id: "cream",
      name: "Cream Theme",
      bgClass: "bg-[#faf6ee]",
      // Warm amber/gold ring for active cream theme
      activeRing: "ring-2 ring-offset-2 ring-[#a16207] border border-[#ebd9c4]",
      inactiveBorder: "border border-[#ebd9c4] hover:scale-110",
    },
    {
      id: "dark",
      name: "Dark Theme",
      bgClass: "bg-[#121212]",
      // Violet ring for active dark theme
      activeRing: "ring-2 ring-offset-2 ring-[#8b5cf6] border border-[#27272a]",
      inactiveBorder: "border border-[#27272a] hover:scale-110",
    },
  ];

  return (
    <div className={`flex items-center gap-3 bg-bg-secondary border border-border-primary px-3 py-1.5 rounded-full shadow-xs transition-all duration-250 ${className}`}>
      <span className="text-[10px] uppercase tracking-widest font-extrabold text-text-secondary mr-1 select-none hidden sm:inline">
        Theme
      </span>
      <div className="flex items-center gap-2">
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.name}
              className={`h-6 w-6 rounded-full cursor-pointer transition-all duration-200 outline-none ${t.bgClass} ${
                isActive ? t.activeRing : t.inactiveBorder
              }`}
              aria-label={t.name}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
