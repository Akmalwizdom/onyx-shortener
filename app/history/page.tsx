'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import { staggerContainer } from '@/lib/animations';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer'; // [NEW]
import { HistoryList } from '@/components/history/HistoryList';

import { useArchive } from '@/hooks/useArchive';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/DialogContext';

export default function HistoryPage() {
  const [filter, setFilter] = useState<'recent' | 'active' | 'expired'>('recent');
  const { links, isLoading, isError, isValidating, clearArchive, isLoadingMore, isReachingEnd, setSize, size } = useArchive(filter);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('[ARCHIVE_DEBUG] Data Updated:', {
      filter,
      linkCount: links?.length,
      isLoading,
      isError: isError?.message || isError,
      isValidating
    });
  }, [filter, links, isLoading, isError, isValidating]);

  return (
    <ResponsiveContainer>
      {/* Mobile Header (Hidden on Desktop) */}
      <header className="sticky top-0 z-50 flex items-center bg-black p-6 pb-4 justify-between border-b border-white/10 md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white flex size-8 shrink-0 items-center justify-center rounded-sm bg-white/5 border border-white/10">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </Link>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-primary text-xl font-extrabold tracking-[0.2em] font-display uppercase">My History</h2>
          {isMounted && isValidating && <span className="text-[8px] text-primary/40 font-mono animate-pulse uppercase tracking-widest">Updating...</span>}
        </div>
        <div className="flex items-center justify-end min-h-[40px]">
          {filter === 'expired' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={async () => {
                const confirmed = await confirm(
                  'CLEAR EXPIRED LINKS?',
                  `Are you sure you want to delete all expired links? This action cannot be undone.`
                );

                if (confirmed) {
                  await clearArchive();
                  showToast('ARCHIVE CLEARED', 'success');
                }
              }}
              className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-white hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">delete_sweep</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* Desktop Header (Hidden on Mobile) */}
      <div className="hidden md:flex items-center justify-between mb-8 pt-2">
        <div>
          <h1 className="text-white text-3xl font-bold leading-none tracking-tighter italic font-display">
            My History
          </h1>
           <div className="flex items-center gap-2 mt-1">
             <p className="font-mono text-xs text-primary/40 tracking-widest">
               Your saved links
             </p>
             {isMounted && isValidating && (
                <span className="text-[8px] text-primary bg-primary/10 px-2 py-0.5 rounded font-mono animate-pulse uppercase tracking-widest">
                  Updating...
                </span>
             )}
           </div>
        </div>
        
        {/* Desktop Filter & Actions */}
        <div className="flex items-center gap-4">
             <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                <button onClick={() => setFilter('recent')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all", filter === 'recent' ? "bg-primary text-black" : "text-white/40 hover:text-white")}>Recent</button>
                <button onClick={() => setFilter('active')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all", filter === 'active' ? "bg-primary text-black" : "text-white/40 hover:text-white")}>Active</button>
                <button onClick={() => setFilter('expired')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all", filter === 'expired' ? "bg-primary text-black" : "text-white/40 hover:text-white")}>Expired</button>
             </div>
             
             {filter === 'expired' && (
                <button 
                  onClick={async () => {
                    const confirmed = await confirm('CLEAR EXPIRED?', 'Delete all expired links safely?');
                    if(confirmed) { await clearArchive(); showToast('CLEARED', 'success'); }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                    <span className="text-xs font-mono font-bold">Clear All</span>
                </button>
             )}
        </div>
      </div>

      {/* Content Area */}
      <motion.main
        className="flex flex-col gap-4 p-4 pt-4 md:p-0 md:pb-0"
        variants={staggerContainer}
        animate="visible"
      >
        {/* Mobile-only Filter (Already shown in header for desktop) */}
        <div className="flex gap-2 px-2 pb-2 md:hidden">
          <button onClick={() => setFilter('recent')} className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all", filter === 'recent' ? "bg-primary text-black" : "border border-white/10 text-white/40")}>Recent</button>
          <button onClick={() => setFilter('active')} className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all", filter === 'active' ? "bg-primary text-black" : "border border-white/10 text-white/40")}>Active</button>
          <button onClick={() => setFilter('expired')} className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all", filter === 'expired' ? "bg-primary text-black" : "border border-white/10 text-white/40")}>Expired</button>
        </div>

        {isError ? (
           <div className="text-center py-10 text-error font-mono border border-error/20 bg-error/5 rounded-xl">ERROR: UNABLE TO LOAD DATABASE</div>
        ) : (
           <HistoryList 
             links={links}
             isLoading={isLoading}
             isLoadingMore={isLoadingMore ?? false}
             isReachingEnd={isReachingEnd ?? false}
             setSize={setSize}
             size={size}
           />
        )}
      </motion.main>

      <BottomNav />
    </ResponsiveContainer>
  );
}
