'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { scaleIn, pulseGlow } from '@/lib/animations';

interface ResultNodeProps {
  shortUrl: string;
  originalUrl: string;
  onNewLink: () => void;
  className?: string;
}

/**
 * Success state display showing the shortened URL with copy functionality.
 */
export function ResultNode({ shortUrl, originalUrl, onNewLink, className }: ResultNodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shortUrl]);

  return (
    <motion.div
      className={cn('relative', className)}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
    >
      {/* Success Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <h4 className="text-primary text-[10px] font-bold leading-normal tracking-[0.2em] uppercase">
            Node_ID: Success
          </h4>
        </div>
      </div>

      {/* Phosphor Pulse Card */}
      <motion.div
        className={cn(
          'bg-white/5 backdrop-blur-3xl rounded-xl p-8',
          'flex flex-col items-center justify-center text-center gap-6',
          'overflow-hidden relative',
          'border border-primary',
          'shadow-[0_0_15px_rgba(168,255,213,0.3)]'
        )}
        variants={pulseGlow}
        initial="initial"
        animate="animate"
      >
        {/* Top decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex flex-col gap-2 w-full">
          <p className="text-white/40 text-[10px] font-medium tracking-[0.15em] uppercase">
            Active_Data_Stream
          </p>
          <p className="text-primary font-mono text-3xl font-bold leading-tight break-all tracking-tight drop-shadow-[0_0_10px_rgba(167,255,210,0.4)]">
            {shortUrl}
          </p>
          <p className="text-white/30 text-xs font-normal leading-normal truncate px-4">
            {originalUrl}
          </p>
        </div>

        {/* Copy Button */}
        <motion.button
          onClick={handleCopy}
          className={cn(
            'group relative flex w-full max-w-[220px] items-center justify-center',
            'overflow-hidden rounded-lg h-12',
            'bg-primary text-black text-sm font-bold leading-normal tracking-[0.1em]',
            'transition-transform active:scale-95'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="truncate">
            {copied ? '✓ COPIED!' : 'COPY TO CLIPBOARD'}
          </span>
        </motion.button>

        {/* Bottom Labels */}
        <div className="w-full flex justify-between mt-2 pt-4 border-t border-white/5">
          <span className="text-[8px] text-white/20 font-mono">STRENGTH: OPTIMAL</span>
          <span className="text-[8px] text-white/20 font-mono">ENCRYPT: AES-256</span>
        </div>
      </motion.div>

      {/* Shadow Glow */}
      <div className="absolute -z-10 inset-0 blur-3xl bg-primary/10 rounded-full" />

      {/* Create New Link Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onNewLink}
          className={cn(
            'bg-white/5 hover:bg-white/10 transition-colors',
            'backdrop-blur-md border border-white/10 rounded-full px-8 py-3',
            'flex items-center gap-3'
          )}
        >
          <span className="material-symbols-outlined text-primary text-sm">add</span>
          <span className="text-white/60 text-[11px] font-bold tracking-[0.2em] uppercase">
            Create New Node
          </span>
        </button>
      </div>
    </motion.div>
  );
}

export default ResultNode;
