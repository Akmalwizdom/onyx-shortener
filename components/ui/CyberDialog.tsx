'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CyberDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CyberDialog({ isOpen, title, message, onConfirm, onCancel }: CyberDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
            onClick={onCancel}
          />
          
          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            className="fixed top-1/2 left-1/2 z-[10000] w-full max-w-sm overflow-hidden rounded-lg border border-primary bg-black/90 p-6 shadow-[0_0_40px_rgba(51,225,255,0.1)]"
          >
             {/* Decorative Corner Lines */}
            <div className="absolute top-0 left-0 h-4 w-4 border-l-2 border-t-2 border-primary" />
            <div className="absolute top-0 right-0 h-4 w-4 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary" />

            <h3 className="mb-2 font-display text-lg font-bold uppercase tracking-wider text-white">
              {title}
            </h3>
            <p className="mb-8 font-mono text-sm text-white/70">
              {message}
            </p>

            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 rounded border border-white/10 py-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded bg-primary py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-white hover:shadow-[0_0_15px_rgba(51,225,255,0.4)] transition-all"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
