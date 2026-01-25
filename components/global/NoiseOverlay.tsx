'use client';

import { cn } from '@/lib/utils';

interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

/**
 * Fixed noise texture overlay for ONYX-CYBER-INDUSTRIAL aesthetic.
 * Renders a grain effect over the entire viewport at low opacity.
 */
export function NoiseOverlay({ className, opacity = 0.05 }: NoiseOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none z-[9999]',
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}

export default NoiseOverlay;
