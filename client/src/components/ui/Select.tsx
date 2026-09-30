/** Select — Light design system version. */
import React from 'react';

interface SelectProps {
  label?: string;
  icon?: React.ElementType;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({ label, icon: Icon, options, value, onChange, placeholder = 'Select...', error }: SelectProps) {
  return (
    <div>
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && (
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
              zIndex: 1,
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
          style={{ paddingLeft: Icon ? 40 : undefined, cursor: 'pointer' }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}
