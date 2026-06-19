import React from "react";

const SelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  disabled = false,
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
      <div className="w-full relative">
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full h-[52px] px-4 bg-white border ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/35"
              : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/35"
          } rounded-xl text-slate-800 text-sm font-sans placeholder-slate-400 focus:ring-1 outline-none appearance-none transition-all duration-300 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLbl = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={idx} value={optVal}>
                {optLbl}
              </option>
            );
          })}
        </select>
        {/* Custom Chevron Indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-[10px] text-red-500 font-medium mt-1.5 pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;
