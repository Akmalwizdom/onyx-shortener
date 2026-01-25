'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopNavProps {
  className?: string;
}

export function TopNav({ className }: TopNavProps) {

  return (
    <div
      className={cn(
        'flex items-center p-6 justify-between z-10 relative', // Added relative for positioning
        className
      )}
    >
      {/* Logo & Branding */}
      <Link href="/" className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-2xl">
          terminal
        </span>
        <h2 className="text-primary font-mono text-sm tracking-[0.2em] font-bold">
          ONYX_v.01
        </h2>
      </Link>

      {/* Status & Menu */}
      <div className="flex items-center gap-4">
        {/* System Status */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-primary/50 font-mono leading-none">
            SYS_STATUS
          </span>
          <span className="text-[10px] text-primary font-mono flex items-center gap-1 mt-0.5">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopNav;
