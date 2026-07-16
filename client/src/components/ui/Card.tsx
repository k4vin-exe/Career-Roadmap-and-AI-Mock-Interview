import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'glass' | 'glass-light';
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({
  variant = 'default',
  children,
  className = '',
  hoverEffect = false,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-surface rounded-2xl border border-border',
    glass: 'glass rounded-2xl',
    'glass-light': 'glass-light rounded-2xl',
  };

  const hoverClass = hoverEffect 
    ? 'hover:border-accent/30 transition-colors duration-300' 
    : '';

  return (
    <motion.div
      className={`${variants[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
