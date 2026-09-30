/** Input — Light design system version. */
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className = '', style, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </div>
        )}
        <input
          className={`input-field ${className}`}
          style={{ paddingLeft: icon ? 40 : undefined, ...style }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}
