import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="text-sm font-medium text-apple-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-apple border px-4 py-3 text-sm text-apple-900 placeholder-apple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue ${
          error ? "border-red-500" : "border-apple-200"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
