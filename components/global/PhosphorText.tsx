'use client';

import { forwardRef, ElementType, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

type GlowLevel = 'normal' | 'intense' | 'none';
type TextVariant = 'default' | 'error' | 'muted';

type PhosphorTextProps<T extends ElementType = 'span'> = {
  as?: T;
  variant?: TextVariant;
  glow?: GlowLevel;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'variant' | 'glow'>;

/**
 * Text component with phosphor glow effect.
 * Creates the distinctive glowing mint text characteristic of the ONYX-CYBER theme.
 */
export const PhosphorText = forwardRef<HTMLElement, PhosphorTextProps>(
  ({ 
    className, 
    as: Component = 'span', 
    variant = 'default',
    glow = 'normal',
    children, 
    ...props 
  }, ref) => {
    const glowStyles: Record<GlowLevel, string> = {
      none: '',
      normal: 'drop-shadow-[0_0_8px_rgba(167,255,210,0.6)]',
      intense: 'drop-shadow-[0_0_12px_rgba(167,255,210,0.8)]',
    };
    
    const variantStyles: Record<TextVariant, string> = {
      default: 'text-primary',
      error: 'text-error drop-shadow-[0_0_8px_rgba(255,77,0,0.6)]',
      muted: 'text-primary/60',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'font-mono',
          variantStyles[variant],
          variant !== 'error' && glowStyles[glow],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

PhosphorText.displayName = 'PhosphorText';

export default PhosphorText;
