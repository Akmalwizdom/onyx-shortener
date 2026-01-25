'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { errorShake } from '@/lib/animations';

interface ErrorNodeProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

/**
 * Error state display with orange theme and retry functionality.
 */
export function ErrorNode({ 
  message = 'CONNECTION_FAILED: Unable to generate short link', 
  onRetry,
  className 
}: ErrorNodeProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center gap-6', className)}
      variants={errorShake}
      initial="initial"
      animate="shake"
    >
      {/* Error Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-error text-2xl">
          error
        </span>
        <span className="text-error text-[10px] font-mono tracking-[0.2em] font-bold uppercase">
          FATAL_ERROR
        </span>
      </div>

      {/* Error Container - Orange themed */}
      <div
        className={cn(
          'w-full max-w-sm p-6 rounded-lg',
          'bg-white/[0.03] backdrop-blur-[40px]',
          'border border-error/40',
          'shadow-[0_0_20px_rgba(255,77,0,0.1)]'
        )}
      >
        {/* Error Message */}
        <div className="flex flex-col gap-4 items-center text-center">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-error/60 tracking-widest uppercase">
              ERROR_LOG
            </span>
            <p className="text-white/80 font-mono text-sm">
              {message}
            </p>
          </div>

          {/* Glitched Input Visual */}
          <div className="w-full h-12 rounded-lg bg-error/10 border border-error/30 flex items-center justify-center relative overflow-hidden">
            <span className="text-error/50 font-mono text-xs tracking-wider">
              ████████████████
            </span>
            {/* Glitch lines */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/3 left-0 w-full h-[1px] bg-error" />
              <div className="absolute top-2/3 left-0 w-2/3 h-[1px] bg-error" />
            </div>
          </div>

          {/* Disabled Generate Button */}
          <button
            disabled
            className={cn(
              'w-full h-12 rounded-lg',
              'bg-white/5 text-white/30 font-bold text-sm tracking-[0.2em]',
              'cursor-not-allowed opacity-50',
              'border border-white/10'
            )}
          >
            GENERATE
          </button>
        </div>
      </div>

      {/* Retry Button */}
      <motion.button
        onClick={onRetry}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-lg',
          'bg-error/20 text-error border border-error/40',
          'hover:bg-error/30 transition-colors',
          'font-mono text-sm tracking-widest'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="material-symbols-outlined text-lg">refresh</span>
        RETRY_CONNECTION
      </motion.button>

      {/* Error Details */}
      <div className="flex gap-6 text-[8px] font-mono text-white/20">
        <span>CODE: ERR_500</span>
        <span>TIMESTAMP: {new Date().toISOString()}</span>
      </div>
    </motion.div>
  );
}

export default ErrorNode;
