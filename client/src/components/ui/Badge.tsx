import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-surface-lighter text-text-secondary border-border',
    success: 'bg-success/10 text-success-light border-success/20',
    warning: 'bg-warning/10 text-warning-light border-warning/20',
    error: 'bg-error/10 text-error-light border-error/20',
    info: 'bg-info/10 text-info border-info/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
