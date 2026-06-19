import React, { useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="bg-bg-secondary border border-border-primary w-full max-w-[480px] rounded-[24px] shadow-2xl relative z-10 overflow-hidden transform transition-all duration-300 animate-scaleIn flex flex-col max-h-[90vh] text-text-primary transition-colors duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-primary">
          <h3 className="font-display font-light text-xl text-text-primary tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1"
          >
            <svg
              className="w-5.5 h-5.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
