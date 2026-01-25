'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'active' | 'ghost' | 'error';
  glow?: boolean;
}

/**
 * Glassmorphism container with blur and semi-transparent background.
 * Core visual component for ONYX-CYBER-INDUSTRIAL design system.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'default', glow = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white/[0.03] border border-primary/10',
      active: 'bg-white/[0.05] border border-primary/40 shadow-[0_0_20px_rgba(167,255,210,0.1)]',
      ghost: 'bg-white/[0.02] border border-white/5 opacity-60',
      error: 'bg-white/[0.03] border border-error/40 shadow-[0_0_20px_rgba(255,77,0,0.1)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'backdrop-blur-[40px] rounded-lg transition-all duration-300',
          variantClasses[variant],
          glow && 'shadow-[inset_0_0_10px_rgba(167,255,210,0.4)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';

export default GlassPanel;
