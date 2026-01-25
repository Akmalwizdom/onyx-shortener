'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UrlInputNodeProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * URL input form with phosphor glow effect.
 * Main interaction point for creating shortened URLs.
 */
export function UrlInputNode({ onSubmit, isLoading = false, className }: UrlInputNodeProps) {
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => {
        setLocalError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const validateUrl = (value: string) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      // Try adding https://
      try {
        new URL(`https://${value}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    let trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    // Auto-prepend protocol if missing
    if (!/^https?:\/\//i.test(trimmedUrl)) {
        trimmedUrl = `https://${trimmedUrl}`;
    }

    if (!validateUrl(trimmedUrl)) {
      setLocalError('Invalid URL format');
      return;
    }

    if (!isLoading) {
      onSubmit(trimmedUrl);
    }
  }, [url, isLoading, onSubmit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (localError) setLocalError(null); // Clear error on type
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Status Micro-Text - Hide if error to avoid clutter or keep it? explicit request didn't fail this, but let's keep it clean */}
      {!localError && (
        <div className="flex justify-between items-end px-1">
          <span className="text-[10px] font-mono text-primary tracking-tighter">
            Paste your long link
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="contents" noValidate>
        {/* Phosphor Input Field */}
        <div className="relative group">
          {/* Glow effect on focus - changes color on error */}
          <div 
            className={cn(
              'absolute -inset-0.5 rounded-lg blur opacity-30',
              'group-focus-within:opacity-100 transition duration-500',
              localError ? 'bg-error/50' : 'bg-primary/20'
            )}
          />
          
          <div className={cn(
            "relative flex w-full items-stretch glass-panel rounded-lg overflow-hidden !p-0 transition-colors duration-300",
            localError ? "!border-error" : "!border-primary/30"
          )}>
            <input
              type="text"
              value={url}
              onChange={handleInputChange}
              placeholder="https://example.com/very-long-url..."
              disabled={isLoading}
              autoComplete="off"
              className={cn(
                'flex w-full min-w-0 flex-1 bg-transparent border-none',
                'text-white placeholder:text-primary/30 p-4 text-sm font-mono',
                'focus:ring-0 focus:outline-none',
                'disabled:opacity-50'
              )}
            />
            <div className={cn("flex items-center px-4", localError ? "text-error" : "text-primary")}>
              <span className="material-symbols-outlined text-xl">link</span>
            </div>
          </div>
        </div>

        {/* Inline Error Display */}
        {localError && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-1 text-error"
            >
                <span className="material-symbols-outlined text-sm">error</span>
                <span className="text-xs font-mono">{localError}</span>
            </motion.div>
        )}

        {/* Generate Button - styled normally, but disabled logic could change usage. Keeping standard. */}
        <motion.button
          type="submit"
          disabled={isLoading || !url.trim()}
          className={cn(
            'group relative flex w-full cursor-pointer items-center justify-center',
            'overflow-hidden rounded-lg h-14',
            'bg-primary text-black transition-all',
            'hover:brightness-110 active:scale-[0.98]',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'inner-glow'
          )}
          initial={false}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Shine effect */}
          <div 
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
              '-translate-x-full group-hover:translate-x-full transition-transform duration-700'
            )}
          />
          
          <span className="font-bold text-sm tracking-[0.3em] font-display">
            {isLoading ? 'WORKING...' : 'SHORTEN'}
          </span>
          <span className="material-symbols-outlined ml-2 text-xl">
            {isLoading ? 'sync' : 'bolt'}
          </span>
        </motion.button>
      </form>

    </div>
  );
}

export default UrlInputNode;
