'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface DisconnectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisconnectConfirmModal({ isOpen, onClose, onConfirm }: DisconnectConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl rounded-lg overflow-hidden"
          >
            {/* Cyber Acent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-error/50 to-transparent"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-error text-3xl animate-pulse">logout</span>
              </div>
              
              <h3 className="text-xl font-display font-bold text-white mb-2 tracking-tight">
                Disconnect Wallet?
              </h3>
              <p className="text-white/40 text-sm font-mono leading-relaxed mb-8">
                You will need to reconnect your wallet to shorten URLs and view your history.
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={onConfirm}
                  className="w-full py-3 bg-error/10 hover:bg-error/20 border border-error/20 text-error font-mono font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                >
                  Confirm Disconnect
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-mono font-bold text-xs uppercase tracking-[0.2em] transition-all hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute bottom-0 right-0 w-12 h-12 opacity-10 pointer-events-none">
              <div className="absolute bottom-2 right-2 w-full h-[1px] bg-white"></div>
              <div className="absolute bottom-2 right-2 w-[1px] h-full bg-white"></div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
