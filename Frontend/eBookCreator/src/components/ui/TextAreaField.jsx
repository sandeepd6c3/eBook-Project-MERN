import React from "react";

const TextAreaField = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col items-start ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="tracking-wider text-[10px] font-bold text-slate-400 uppercase mb-2 block"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-3 bg-white border ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/35"
            : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/35"
        } rounded-xl text-slate-800 text-sm font-sans placeholder-slate-400 focus:ring-1 outline-none resize-none transition-all duration-300 disabled:bg-slate-50 disabled:text-slate-400`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-red-500 font-medium mt-1.5 pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextAreaField;
