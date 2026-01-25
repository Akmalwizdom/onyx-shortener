'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const borderColor = 
    type === 'success' ? 'border-primary' : 
    type === 'error' ? 'border-red-500' : 
    'border-white/20';

  const textColor = 
    type === 'success' ? 'text-primary' : 
    type === 'error' ? 'text-red-500' : 
    'text-white';

  const icon = 
    type === 'success' ? 'check_circle' : 
    type === 'error' ? 'error' : 
    'info';

  const glowColor =
    type === 'success' ? 'rgba(51, 225, 255, 0.2)' : 
    type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
    'rgba(255, 255, 255, 0.1)';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-3 rounded-sm bg-black/90 backdrop-blur-md border ${borderColor} shadow-[0_0_15px_${glowColor}] min-w-[300px] max-w-[90vw]`}
        >
          <span className={`material-symbols-outlined ${textColor} text-xl animate-pulse`}>
            {icon}
          </span>
          <p className={`font-mono text-xs ${textColor} tracking-wider font-bold uppercase`}>
            {message}
          </p>
          <div className="absolute top-0 left-0 w-[2px] h-full bg-current opacity-50" />
          <div className="absolute bottom-0 right-0 w-[2px] h-full bg-current opacity-50" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
