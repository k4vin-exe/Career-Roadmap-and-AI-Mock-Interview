import React from 'react';

interface SelectProps {
  label?: string;
  icon?: React.ElementType;
  options: readonly string[] | string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function Select({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  error,
  className = '',
}: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          {Icon && <Icon size={16} />}
          {label}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 cursor-pointer
              ${
                value === option
                  ? 'bg-accent/15 border border-accent text-accent-light'
                  : 'bg-surface-light border border-border text-text-secondary hover:border-border-light hover:text-text-primary'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
