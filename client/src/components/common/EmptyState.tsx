/** EmptyState — Illustrated empty state with icon, title, body, and CTA */

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  cta?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'coral';
  };
}

export function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  const btnCls = cta?.variant === 'coral' ? 'btn btn-coral btn-md' : 'btn btn-primary btn-md';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 32px',
        borderRadius: 'var(--radius-card)',
        border: '1.5px dashed var(--border-strong)',
        background: 'var(--surface-muted)',
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'var(--primary-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          marginBottom: 20,
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: cta ? 24 : 0,
        }}
      >
        {body}
      </p>

      {cta && (
        <button className={btnCls} onClick={cta.onClick}>
          {cta.label}
        </button>
      )}
    </div>
  );
}
