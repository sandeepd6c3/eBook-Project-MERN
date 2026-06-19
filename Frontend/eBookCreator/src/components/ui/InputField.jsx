import React from "react";

const InputField = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
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
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full h-[52px] px-4 bg-bg-secondary text-text-primary border ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-500/35" : "border-border-primary focus:border-accent-primary focus:ring-accent-ring/35"
        } rounded-xl text-sm font-sans placeholder-text-muted focus:ring-1 outline-none transition-all duration-300 disabled:bg-bg-tertiary disabled:text-text-muted`}
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

export default InputField;
