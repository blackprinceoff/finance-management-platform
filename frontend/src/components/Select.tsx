import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export default function Select({
  label,
  error,
  id,
  options,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="text-sm font-medium text-apple-700">
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full rounded-apple border bg-white px-4 py-3 text-sm text-apple-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue ${
          error ? "border-red-500" : "border-apple-200"
        } ${className}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
