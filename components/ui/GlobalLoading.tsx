"use client";

import { motion } from 'framer-motion';

export const GlobalLoading = () => {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background-dark z-50">
      {/* Background Data Stream Effect */}
      <div className="absolute inset-0 pointer-events-none flex justify-around px-4 opacity-20 overflow-hidden">
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-40 animate-pulse">SYSTEM_INIT</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-20 pt-20">LOADING_ASSETS</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-60 pt-10">CORE_MODULES</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-30 pt-40">CYBER_XYNO</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-50">SYNC_DATABANKS</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-10 pt-12">V_4.0.1</div>
      </div>

      {/* Central Processing Node */}
      <div className="relative z-10 w-full max-w-[280px]">
        <div className="glass-node w-full py-12 px-6 flex flex-col items-center gap-6 rounded-sm relative overflow-hidden ring-1 ring-primary/20">
          {/* Phosphor Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary"></div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 blur-xl rounded-full"></div>
            <span className="material-symbols-outlined text-4xl text-primary relative animate-spin-slow">hourglass_empty</span>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-primary tracking-[0.2em] text-lg font-bold leading-tight uppercase animate-pulse">System_Loading...</h2>
            <p className="text-primary/60 text-[10px] font-medium tracking-[0.1em] uppercase">Initializing_Interface</p>
          </div>

          <div className="flex gap-1.5">
            <motion.div 
              className="w-1 h-1 bg-primary"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div 
              className="w-1 h-1 bg-primary/40"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
            />
            <motion.div 
              className="w-1 h-1 bg-primary/20"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
            />
          </div>
        </div>

        {/* System Stats Floating */}
        <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-2">
          <div className="flex flex-col">
            <span className="text-[8px] text-primary/40 uppercase tracking-tighter">Mem_Alloc</span>
            <span className="text-[10px] text-primary/80 font-mono">allocating...</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[8px] text-primary/40 uppercase tracking-tighter">Status</span>
            <span className="text-[10px] text-primary/80 font-mono">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
