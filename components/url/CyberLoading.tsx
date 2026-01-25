import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export const CyberLoading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster animation to match real API speed (unmounts when done)
    const totalDuration = 800;  
    const intervalTime = 30;
    const steps = totalDuration / intervalTime;
    const increment = 100 / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      // Add a little randomness to the speed for "realism"
      if (Math.random() > 0.7) current += 1;
      
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
      }
      setProgress(Math.floor(current));
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background-dark/90 backdrop-blur-sm z-50">
      {/* Background Data Stream Effect */}
      <div className="absolute inset-0 pointer-events-none flex justify-around px-4 opacity-20 overflow-hidden">
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-40 animate-pulse">0101X9Z_LOAD_NODE_04</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-20 pt-20">ENCRYPT_88_V_2</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-60 pt-10">CORE_SYS_STAGING</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-30 pt-40">CYBER_ONYX_STREAM</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-50">NULL_PTR_ERROR_RESOLVED</div>
        <div className="data-stream-text text-[10px] tracking-widest text-primary leading-none opacity-10 pt-12">BOOT_LOADER_V4</div>
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
            <span className="material-symbols-outlined text-4xl text-primary relative animate-spin-slow">memory</span>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-primary tracking-[0.2em] text-lg font-bold leading-tight uppercase animate-pulse">Encrypting_Link...</h2>
            <p className="text-primary/60 text-[10px] font-medium tracking-[0.1em] uppercase">Generating_Node_{progress < 10 ? `0${progress}` : progress}.X</p>
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
            <span className="text-[8px] text-primary/40 uppercase tracking-tighter">Lat_Buffer</span>
            <span className="text-[10px] text-primary/80 font-mono">0.0042ms</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[8px] text-primary/40 uppercase tracking-tighter">Node_ID</span>
            <span className="text-[10px] text-primary/80 font-mono">0x7F2A</span>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-20 w-full max-w-md px-8 z-10">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <p className="text-primary text-[10px] font-bold tracking-[0.2em] leading-none uppercase">System_Staging</p>
              <p className="text-primary/40 text-[9px] font-normal leading-normal uppercase">Async_Packet_Load</p>
            </div>
            <p className="text-primary text-sm font-mono leading-none">{progress}%</p>
          </div>
          <div className="glitch-bar-container w-full relative overflow-hidden">
            <motion.div 
              className="glitch-bar-fill" 
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50 }}
            />
            {/* Glitch fragments */}
            <div className="absolute top-0 left-[62%] w-[4px] h-[1px] bg-primary blur-[1px] animate-pulse"></div>
            <div className="absolute top-0 left-[20%] w-[1px] h-[1px] bg-primary/30"></div>
          </div>
          <div className="flex justify-between pt-2">
            <div className="text-[9px] text-primary/30 font-mono">SECURE_TUNNEL_ESTABLISHED</div>
            <div className="text-[9px] text-primary/30 font-mono">MTU:1500</div>
          </div>
        </div>
      </div>
    </div>
  );
};
