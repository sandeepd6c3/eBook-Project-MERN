import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold text-xs tracking-wider uppercase transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-slate-900 text-white border border-slate-900 px-6 py-3 hover:bg-slate-800",
    secondary:
      "bg-transparent border border-slate-900 text-slate-900 px-6 py-3 hover:bg-slate-50",
    text: "text-slate-600 hover:text-slate-900 px-4 py-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
