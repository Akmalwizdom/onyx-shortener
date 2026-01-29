'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface CyberToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export function CyberToast({ message, type = 'info', isVisible, onClose }: CyberToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Increased to 5s for better readability of complex messages
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const borderColor = 
    type === 'success' ? 'border-primary' : 
    type === 'error' ? 'border-red-500' : 
    type === 'warning' ? 'border-orange-500' : 
    'border-white/20';

  const textColor = 
    type === 'success' ? 'text-primary' : 
    type === 'error' ? 'text-red-500' : 
    type === 'warning' ? 'text-orange-500' : 
    'text-white';

  const icon = 
    type === 'success' ? 'check_circle' : 
    type === 'error' ? 'error' : 
    type === 'warning' ? 'timer' : 
    'info';

  const glowColor =
    type === 'success' ? 'rgba(51, 225, 255, 0.2)' : 
    type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
    type === 'warning' ? 'rgba(249, 115, 22, 0.3)' : 
    'rgba(255, 255, 255, 0.1)';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "fixed top-6 right-6 z-[9999] flex items-center gap-4 px-6 py-3 rounded-sm bg-black/90 backdrop-blur-md border",
            borderColor,
            type === 'warning' ? "shadow-[0_0_20px_rgba(249,115,22,0.3)] py-4 min-w-[320px]" : `shadow-[0_0_15px_${glowColor}] min-w-[300px]`
          )}
        >
          {type === 'warning' ? (
            <>
              <div className="flex items-center justify-center">
                <span className={`material-symbols-outlined ${textColor} text-2xl animate-pulse`}>
                  {icon}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`font-mono text-[10px] ${textColor} opacity-60 tracking-[0.2em] font-bold uppercase`}>
                  SYSTEM_QUOTA_STALLED
                </span>
                <p className="font-mono text-xs text-white tracking-wider font-medium leading-relaxed uppercase">
                  {message}
                </p>
              </div>
              <div className={cn("absolute top-0 left-0 w-[2px] h-full opacity-40", type === 'warning' ? "bg-orange-500" : "bg-current")} />
              <div className={cn("absolute bottom-0 right-0 w-[2px] h-full opacity-40", type === 'warning' ? "bg-orange-500" : "bg-current")} />
              <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${borderColor}`} />
              <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${borderColor}`} />
            </>
          ) : (
            <>
              <span className={`material-symbols-outlined ${textColor} text-xl animate-pulse`}>
                {icon}
              </span>
              <p className={`font-mono text-xs ${textColor} tracking-wider font-bold uppercase`}>
                {message}
              </p>
              <div className="absolute top-0 left-0 w-[2px] h-full bg-current opacity-50" />
              <div className="absolute bottom-0 right-0 w-[2px] h-full bg-current opacity-50" />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
