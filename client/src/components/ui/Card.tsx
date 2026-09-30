/**
 * Card — Updated for the light design system.
 * Variants map to new CSS card classes.
 */
import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'glass-light' | 'dark';
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
  const variantMap: Record<string, string> = {
    default:      'card',
    glass:        'card-glass',
    'glass-light':'card-glass',
    dark:         'card-dark',
  };

  return (
    <motion.div
      className={`${variantMap[variant] ?? 'card'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
