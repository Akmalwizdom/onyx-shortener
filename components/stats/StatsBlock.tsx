'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface StatsBlockProps {
  label: string;
  value: string | number;
  icon?: string;
  className?: string;
}

/**
 * Industrial-styled statistics display block.
 */
export const StatsBlock = forwardRef<HTMLDivElement, StatsBlockProps>(
  ({ label, value, icon, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-1 flex-col gap-1 rounded-lg p-4',
          'border border-primary/20 bg-primary/5',
          className
        )}
      >
        <p className="text-primary/60 text-[10px] font-mono leading-none tracking-tighter uppercase">
          {label}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-white text-xl font-bold font-mono">{value}</p>
          {icon && (
            <span className="material-symbols-outlined text-primary/40 text-lg">
              {icon}
            </span>
          )}
        </div>
      </div>
    );
  }
);

StatsBlock.displayName = 'StatsBlock';

export default StatsBlock;
