'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNav } from '@/components/navigation/TopNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import { StatsBlock } from '@/components/stats/StatsBlock';
import { UrlInputNode } from '@/components/url/UrlInputNode';
import { ErrorNode } from '@/components/url/ErrorNode';
import { useUrlShortener } from '@/hooks/useUrlShortener';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useArchive, type Link as ArchiveLink } from '@/hooks/useArchive';
import { useToast } from '@/context/ToastContext';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json().then(json => json.data));

export default function Home() {
  const { state, shortUrl, error, submit, retry } = useUrlShortener();
  const { links: recentLinks } = useArchive('recent', 3);
  const { showToast } = useToast();
  const router = useRouter();

  const { data: analytics } = useSWR('/api/analytics', fetcher, {
    refreshInterval: 5000 // Refresh every 5s for live feel
  });

  useEffect(() => {
    if (state === 'SUCCESS' && shortUrl) {
      // Delay slightly to let the loading animation finish its cycle or just provide a smoother transition
      const timer = setTimeout(() => {
        router.push(`/share?short=${encodeURIComponent(shortUrl.shortUrl)}&original=${encodeURIComponent(shortUrl.originalUrl)}`);
      }, 500); // 500ms delay for transition feel
      return () => clearTimeout(timer);
    }
  }, [state, shortUrl, router]);

  return (
    <ResponsiveContainer>
      {/* Mobile Top Navigation (Hidden on Desktop) */}
      <div className="md:hidden">
        <TopNav />
      </div>

      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-[48px] font-bold leading-none tracking-tighter italic font-display mb-2">
            URL//<br/><span className="text-primary">SHORT</span>
          </h1>
          <p className="font-mono text-xs text-primary/40 tracking-widest">Minimalist Link Manager</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 md:gap-8 overflow-hidden">
        
        {/* Left Column (Desktop: Input & Stats) */}
        <div className="flex-1 flex flex-col md:col-span-8 overflow-y-auto no-scrollbar md:overflow-visible">
          
          {/* Mobile Title (Hidden on Desktop) */}
          <motion.div 
            className="md:hidden px-6 pt-2 mb-8" 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-white text-[32px] font-bold leading-none tracking-tighter mb-2 italic font-display">
              URL//<br/><span className="text-primary">SHORT</span>
            </h1>
            <p className="font-mono text-mono text-xs text-primary/40 tracking-widest">Minimalist Link Manager</p>
          </motion.div>

          {/* Desktop Stats (Reordered: Top on Desktop) */}
           <motion.div 
            className="px-6 md:px-0 flex flex-col gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
             {/* Desktop Input Area (Visible on Desktop) */}
             <div className="hidden md:block">
                 <div className="p-1 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent mb-6">
                    <div className="bg-black/90 backdrop-blur-xl rounded-xl p-8 border border-white/5">
                        <AnimatePresence mode="wait">
                          {(state === 'IDLE' || state === 'ERROR' || state === 'LOADING') && (
                            <motion.div
                              key="input-desktop"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <UrlInputNode onSubmit={submit} isLoading={state === 'LOADING'} />
                            </motion.div>
                          )}

                          {state === 'ERROR' && (
                            <motion.div
                              key="error-desktop"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="mt-4"
                            >
                              <ErrorNode message={error || undefined} onRetry={retry} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                 </div>
             </div>

             {/* Usage Stats */}
             <div className="grid grid-cols-2 gap-4">
                <StatsBlock 
                    label="LINKS CREATED" 
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

          {/* Mobile Recent History (Keep original position for mobile) */}
          <motion.div className="md:hidden px-6 mt-8 mb-4" variants={fadeInUp} initial="hidden" animate="visible">
            <p className="text-[10px] font-mono text-primary/40 mb-3 tracking-widest">
              RECENT HISTORY
            </p>
            <div className="space-y-2">
              {recentLinks.length === 0 ? (
                  <div className="flex items-center justify-center p-3 rounded bg-white/5 border border-white/5 text-white/30 text-[10px] font-mono">
                    NO RECENT LINKS
                  </div>
              ) : (
                recentLinks.slice(0, 3).map((link: ArchiveLink) => (
                  <div key={link.id} className="flex items-center justify-between p-3 rounded bg-white/5 border-l-2 border-primary hover:bg-white/10 transition-colors">
                    <div className="overflow-hidden mr-3">
                      <p className="text-xs font-mono text-white/80 truncate">{link.shortUrl.replace(/^https?:\/\//, '')}</p>
                      <p className="text-[10px] font-mono text-primary/40 truncate">
                        {link.originalUrl}
                      </p>
                    </div>
                    <span 
                      onClick={() => {
                          navigator.clipboard.writeText(link.shortUrl);
                          showToast('LINK COPIED TO CLIPBOARD', 'success');
                      }}
                      className="material-symbols-outlined text-primary/60 text-sm cursor-pointer hover:text-primary transition-colors shrink-0"
                    >
                      content_copy
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>

        {/* Right Column (Desktop: Detailed History) */}
        <div className="hidden md:flex md:col-span-4 flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <span className="text-xs font-mono text-primary/80 tracking-widest">Recent Activity</span>
                <span className="material-symbols-outlined text-primary/50 text-sm">history</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {recentLinks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/20">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                    <p className="text-xs font-mono">No records found</p>
                  </div>
                ) : (
                    recentLinks.map((link: ArchiveLink) => (
                    <div key={link.id} className="group p-3 rounded-lg bg-black/40 border border-white/5 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-primary font-mono truncate max-w-[150px] block">{link.shortUrl.replace(/^https?:\/\//, '')}</span>
                            <span className="text-[10px] text-white/30 font-mono">{new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-white/50 truncate mb-2">{link.originalUrl}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {link.clickCount} CLICKS
                            </span>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(link.shortUrl);
                                    showToast('COPIED', 'success');
                                }}
                                className="text-white/20 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                        </div>
                    </div>
                    ))
                )}
             </div>
        </div>

      </div>


      {/* Mobile: Bottom Interaction Area (Thumb Zone - Bottom) */}
      <div className="md:hidden w-full px-6 pt-6 pb-24 bg-black border-t border-white/10 mt-auto sticky bottom-0 z-20">
        <AnimatePresence mode="wait">
          {(state === 'IDLE' || state === 'ERROR') && (
            <motion.div
              key="input-mobile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UrlInputNode onSubmit={submit} isLoading={false} />
            </motion.div>
          )}

          {state === 'ERROR' && (
            <motion.div
              key="error-mobile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorNode message={error || undefined} onRetry={retry} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />

      {/* Background Grid Visual */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-[-1]">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/5" />
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-primary/5" />
      </div>
    </ResponsiveContainer>
  );
}
