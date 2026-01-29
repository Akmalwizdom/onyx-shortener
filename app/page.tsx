'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import useSWR from 'swr';

import { TopNav } from '@/components/navigation/TopNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import { StatsBlock } from '@/components/stats/StatsBlock';
import { UrlInputNode, type AccessPolicy } from '@/components/url/UrlInputNode';
import { ErrorNode } from '@/components/url/ErrorNode';
import { CyberLoading } from '@/components/url/CyberLoading';
import { useUrlShortener } from '@/hooks/useUrlShortener';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useToast } from '@/context/ToastContext';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

const fetcher = (url: string) => fetch(url).then(res => res.json().then(json => json.data));

export default function Home() {
  const { state, shortUrl, error, errorCode, resetTime, quota, submit, retry } = useUrlShortener();
  const { showToast } = useToast();
  const router = useRouter();
  const { address, isConnected } = useAccount();

  // 1. Fetch Global Analytics
  const { data: analytics } = useSWR('/api/analytics', fetcher, {
    refreshInterval: 10000 
  });

  // 2. Fetch User History (Only if Connected)
  const { data: userHistory, mutate: refreshHistory } = useSWR(
    isConnected && address ? `/api/history?wallet=${address}` : null, 
    fetcher
  );

  // Redirect to share page when a new link is created successfully
  // Redirect to share page when a new link is created successfully
  useEffect(() => {
    if (state === 'SUCCESS' && shortUrl) {
      refreshHistory();
      
      // Redirect to the share page with parameters immediately
      const params = new URLSearchParams();
      params.set('short', shortUrl.shortUrl);
      params.set('original', shortUrl.originalUrl);
      
      // Use quota from the hook's state
      if (quota) {
        params.set('rem', quota.remaining.toString());
        params.set('lim', quota.limit.toString());
      }
      
      router.push(`/share?${params.toString()}`);
    }
  }, [state, shortUrl, quota, refreshHistory, showToast, router]);

  // Handle Rate Limit Toast separately for better visibility
  useEffect(() => {
    if (state === 'ERROR' && errorCode === 429) {
      const message = !isConnected 
        ? 'RATE LIMIT REACHED: CONNECT WALLET FOR MORE QUOTA' 
        : 'DAILY QUOTA EXCEEDED: TRY AGAIN TOMORROW';
      showToast(message, 'warning');
    }
  }, [state, errorCode, isConnected, showToast]);

  return (
    <ResponsiveContainer>
      <AnimatePresence>
        {state === 'LOADING' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <CyberLoading />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden">
        <TopNav />
      </div>

      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-[48px] font-bold leading-none tracking-tighter italic font-display mb-2">
            XYNO//<br/><span className="text-primary">PROTOCOL</span>
          </h1>
          <p className="font-mono text-xs text-primary/40 tracking-widest">Base Native Access Gateway</p>
        </div>

      </div>

      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 md:gap-8 overflow-hidden">
        
        {/* Left Column (Desktop: Input & Stats) */}
        <div className="flex-1 flex flex-col md:col-span-8 overflow-y-auto no-scrollbar md:overflow-visible">
          
          <motion.div 
            className="md:hidden px-6 pt-2 mb-8" 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-white text-[32px] font-bold leading-none tracking-tighter mb-2 italic font-display">
              XYNO//<br/><span className="text-primary">PROTOCOL</span>
            </h1>
            <p className="font-mono text-mono text-xs text-primary/40 tracking-widest">Base Native Access Gateway</p>
          </motion.div>

           <motion.div 
            className="px-6 md:px-0 flex flex-col gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
             {/* Desktop Input Area */}
             <div className="hidden md:block">
                 <div className="p-1 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent mb-6">
                    <div className="bg-black/90 backdrop-blur-xl rounded-xl p-8 border border-white/5">
                        <AnimatePresence mode="wait">
                          {(state === 'IDLE' || state === 'ERROR' || state === 'LOADING' || state === 'SUCCESS') && (
                            <motion.div
                              key="input-desktop"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <UrlInputNode onSubmit={submit} isLoading={state === 'LOADING'} quota={quota} />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {state === 'ERROR' && errorCode !== 429 && (
                            <div className="mt-4">
                              <ErrorNode 
                                message={error || undefined} 
                                code={errorCode || undefined}
                                resetTime={resetTime}
                                onRetry={retry} 
                              />
                            </div>
                        )}
                    </div>
                 </div>
             </div>

             {/* Global Stats */}
             <div className="grid grid-cols-2 gap-4">
                <StatsBlock 
                    label="TOTAL LINKS" 
                    value={analytics ? analytics.totalLinks.toLocaleString() : '...'} 
                    icon="link" 
                />
                <StatsBlock 
                    label="TOTAL CLICKS" 
                    value={analytics ? analytics.totalClicks.toLocaleString() : '...'} 
                    icon="ads_click" 
                />
             </div>
          </motion.div>
        </div>

        {/* Right Column (History) */}
        <div className="hidden md:flex md:col-span-4 flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <span className="text-xs font-mono text-primary/80 tracking-widest">YOUR ARCHIVE</span>
                <span className="material-symbols-outlined text-primary/50 text-sm">history</span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {!isConnected ? (
                     <div className="h-full flex flex-col items-center justify-center text-white/20 text-center">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">wallet</span>
                        <p className="text-xs font-mono mb-1">Connect Wallet</p>
                        <p className="text-[10px] opacity-50">to view your link history</p>
                    </div>
                ) : !userHistory || userHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/20">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                    <p className="text-xs font-mono">No links created yet</p>
                  </div>
                ) : (
                    userHistory.map((link: any) => {
                        const isLocked = link.access_policy && Object.keys(link.access_policy).length > 0;
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
                        const fullShortUrl = `${baseUrl}/${link.short_code}`;

                        return (
                            <div key={link.id} className="group p-3 rounded-lg bg-black/40 border border-white/5 hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-mono truncate max-w-[120px]", isLocked ? "text-error" : "text-primary")}>
                                            /{link.short_code}
                                        </span>
                                        {isLocked && <span className="text-[10px] text-error">🔒</span>}
                                    </div>
                                    <span className="text-[10px] text-white/30 font-mono">
                                        {new Date(link.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/50 truncate mb-2">{link.original_url}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {link.click_count} CLICKS
                                    </span>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(fullShortUrl);
                                            showToast('COPIED', 'success');
                                        }}
                                        className="text-white/20 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
             </div>
        </div>
      </div>

      {/* Mobile Input Area */}
      <div className="md:hidden w-full px-6 pt-6 pb-24 bg-black border-t border-white/10 mt-auto sticky bottom-0 z-20">
        <AnimatePresence mode="wait">
          {(state === 'IDLE' || state === 'ERROR' || state === 'SUCCESS' || state === 'LOADING') && (
            <motion.div
              key="input-mobile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
               <UrlInputNode onSubmit={submit} isLoading={state === 'LOADING'} quota={quota} />
            </motion.div>
          )}

          {state === 'ERROR' && errorCode !== 429 && (
            <motion.div key="error-mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ErrorNode 
                message={error || undefined} 
                code={errorCode || undefined}
                resetTime={resetTime}
                onRetry={retry} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />

      {/* Background Visual */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-[-1]">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/5" />
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-primary/5" />
      </div>
    </ResponsiveContainer>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}