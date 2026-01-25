'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingNodeProps {
  className?: string;
}

/**
 * Loading/encrypting animation state with progress bar and data stream effect.
 */
export function LoadingNode({ className }: LoadingNodeProps) {
  const [progress, setProgress] = useState(0);
  const [nodeId, setNodeId] = useState('TX_PENDING');

  useEffect(() => {
    // Delay setting ID to avoid synchronous state update warning during hydration fix
    const timer = setTimeout(() => {
        setNodeId(`TX_${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-12', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Encrypting Text */}
      <motion.div
        className="flex items-center gap-2 mb-8"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="material-symbols-outlined text-primary text-xl animate-spin">
          sync
        </span>
        <span className="text-primary font-mono text-sm tracking-[0.3em] font-bold">
          ENCRYPTING
        </span>
      </motion.div>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs relative">
        {/* Background track */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-primary/20">
          {/* Progress fill */}
          <motion.div
            className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(167,255,210,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Percentage */}
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-mono text-primary/40">
            PROGRESS
          </span>
          <span className="text-[10px] font-mono text-primary">
            {Math.min(Math.round(progress), 100)}%
          </span>
        </div>
      </div>

      {/* System Stats */}
      <div className="flex gap-8 mt-8">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] font-mono text-primary/30 tracking-widest">
            LAT_BUFFER
          </span>
          <span className="text-xs font-mono text-primary/60">
            24ms
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] font-mono text-primary/30 tracking-widest">
            NODE_ID
          </span>
          <span className="text-xs font-mono text-primary/60">
            {nodeId}
          </span>
        </div>
      </div>

      {/* Data Stream Background Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[8px] font-mono text-primary whitespace-nowrap"
            initial={{ x: '-100%', y: `${20 + i * 15}%` }}
            animate={{ x: '200%' }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.5,
            }}
          >
            {'0'.repeat(50).split('').map(() => Math.random() > 0.5 ? '1' : '0').join('')}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default LoadingNode;
