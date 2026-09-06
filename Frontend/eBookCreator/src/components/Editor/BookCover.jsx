import React from "react";

const BookCover = ({ config, title, author, className = "" }) => {
  const isGradientClass = config?.gradient && (config.gradient.startsWith("bg-") || config.gradient.includes("from-"));

  return (
    <div
      className={`relative rounded-r-md shadow-lg overflow-hidden border-l-[3px] border-black/30 flex flex-col justify-between p-3 aspect-[3/4.2] text-white ${className}`}
      style={{
        backgroundImage: config?.imageUrl ? `url(${config.imageUrl})` : undefined,
        backgroundSize: config?.imageUrl ? "cover" : undefined,
        backgroundPosition: config?.imageUrl ? "center" : undefined,
        background: config?.imageUrl ? undefined : (isGradientClass ? undefined : (config?.gradient || "linear-gradient(135deg, #1e3a8a, #3b82f6)")),
      }}
    >
      {/* Crease spine shadow */}
      <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-r from-black/25 via-white/5 to-transparent z-10"></div>
      
      {/* Dark overlay for readability */}
      {config?.imageUrl && (
        <div className="absolute inset-0 bg-black/40 z-0"></div>
      )}

      {/* Content wrapper with z-10 to sit above overlay */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {config?.style === "minimalist" ? (
          <div className="h-full flex flex-col justify-between text-left">
            <div className="text-[7px] tracking-widest uppercase opacity-60 font-mono">
              {config?.subtitle || "EBOOK SPECIFICATION"}
            </div>
            <h4 className="font-sans font-extrabold text-xs sm:text-sm leading-tight tracking-tight mt-2 text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[7px] font-medium opacity-80 mt-auto font-mono truncate">
              BY {author?.toUpperCase() || "AUTHOR"}
            </div>
          </div>
        ) : config?.style === "editorial" ? (
          <div className="h-full flex flex-col items-center justify-between text-center border border-white/20 p-1.5 rounded-xs">
            <div className="text-[6px] tracking-widest uppercase opacity-60 font-mono">
              {config?.subtitle || "FIRST EDITION"}
            </div>
            <h4 className="font-display font-light text-sm sm:text-base italic leading-tight my-auto text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[7px] tracking-wider uppercase opacity-75 truncate w-full">
              {author || "AUTHOR"}
            </div>
          </div>
        ) : config?.style === "geometric" ? (
          <div className="h-full flex flex-col justify-between relative">
            <div className="absolute -top-6 -right-6 w-14 h-14 rounded-full bg-white/10 blur-xs"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-black/20 blur-sm"></div>
            
            <div className="z-10">
              <h4 className="font-sans font-black text-xs sm:text-sm uppercase leading-none tracking-tighter text-white line-clamp-3">
                {title}
              </h4>
              <div className="w-5 h-0.5 bg-white/60 mt-1"></div>
            </div>
            <div className="z-10 text-right mt-auto">
              <span className="text-[7px] font-bold tracking-widest uppercase opacity-90 block truncate">
                {author || "AUTHOR"}
              </span>
              <span className="text-[5px] opacity-50 block font-mono">
                {config?.subtitle || "DIGITAL PUBLICATION"}
              </span>
            </div>
          </div>
        ) : (
          /* default: modern */
          <div className="h-full flex flex-col justify-between text-center">
            <div>
              <div className="text-[6px] tracking-widest uppercase opacity-75 bg-black/10 inline-block px-1.5 py-0.5 rounded-full font-mono">
                {config?.subtitle || "EBOOK"}
              </div>
            </div>
            <h4 className="font-display font-medium text-xs sm:text-sm leading-tight tracking-normal my-auto text-white line-clamp-3">
              {title}
            </h4>
            <div className="text-[7px] tracking-wider font-semibold opacity-90 border-t border-white/20 pt-1 truncate w-full">
              {author || "AUTHOR"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCover;
