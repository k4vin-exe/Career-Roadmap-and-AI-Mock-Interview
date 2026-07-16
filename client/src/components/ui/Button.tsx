import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-xl cursor-pointer disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-accent-dark via-accent to-accent-light text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:hover:shadow-none',
    secondary: 'bg-surface-lighter text-text-primary hover:bg-border disabled:opacity-50',
    outline: 'border border-border text-text-primary hover:border-accent hover:text-accent-light disabled:opacity-50',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
