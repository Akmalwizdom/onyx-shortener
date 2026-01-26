'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer'; // [NEW]
import { staggerContainer, fadeInUp, listItemVariant } from '@/lib/animations';

interface AnalyticsData {
  totalLinks: number;
  totalClicks: number;
  uniqueSources: number;
  avgLatency: number;
  referrals: Array<{
    domain: string;
    count: number;
  }>;
  chartData: number[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json().then(json => json.data));

const EMPTY_ARRAY: number[] = [];

export default function AnalyticsPage() {
  // Poll every 3 seconds for "Live" feel
  const { data } = useSWR<AnalyticsData>('/api/analytics', fetcher, {
    refreshInterval: 3000,
  });

  const loading = !data;

  // Use data or fallbacks ensuring 0 is displayed
  const totalClicks = data?.totalClicks ?? 0;
  // const totalLinks = data?.totalLinks ?? 0;
  const uniqueSources = data?.uniqueSources ?? 0;
  // const avgLatency = data?.avgLatency ?? 0;
  const referrals = data?.referrals || [];
  const chartValues = data?.chartData || EMPTY_ARRAY;

  // Generate SVG Path for Chart
  const chartPath = useMemo(() => {
    if (!chartValues.length) return "M0,150 L400,150";

    const max = Math.max(...chartValues, 10); // Minimum scale of 10
    const points = chartValues.map((val: number, i: number) => {
      const x = (i / (chartValues.length - 1)) * 400;
      const y = 150 - (val / max) * 120; // 150 height, 120 max drawn height (keep padding)
      return `${x},${y}`;
    });

    // Create smooth curve or simple line
    return `M0,150 L0,${150 - (chartValues[0]/max)*120} L${points.join(' L')} L400,150 Z`;
  }, [chartValues]);

  // Line only path (without close)
  const linePath = useMemo(() => {
    if (!chartValues.length) return "";
    const max = Math.max(...chartValues, 10); 
    return chartValues.map((val: number, i: number) => {
      const x = (i / (chartValues.length - 1)) * 400;
      const y = 150 - (val / max) * 120;
      return `${i===0?'M':'L'}${x},${y}`;
    }).join(' ');
  }, [chartValues]);

  return (
    <ResponsiveContainer>
      {/* Mobile Header (Hidden on Desktop) */}
      <header className="sticky top-0 z-50 flex items-center bg-black p-6 pb-4 justify-between border-b border-white/10 md:hidden">
        <div className="flex items-center gap-3">
          <div className="text-primary flex size-8 shrink-0 items-center justify-center border border-primary/40 rounded-sm">
            <span className="material-symbols-outlined text-xl">terminal</span>
          </div>
          <h1 className="text-white text-2xl heading-style tracking-tighter">
            Analytics
          </h1>
        </div>
      </header>

      {/* Desktop Header (Hidden on Mobile) */}
      <div className="hidden md:flex items-center justify-between mb-8 pt-2">
         <div>
            <h1 className="text-white text-3xl font-bold leading-none tracking-tighter italic font-display">
                Global Overview
            </h1>
            <p className="font-mono text-xs text-primary/40 tracking-widest mt-1">
                Live Platform Stats
            </p>
         </div>
      </div>

      {/* Main Content */}
      <motion.main
        className="flex-1 pb-24 md:pb-0"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8 min-h-[500px]">
            
            {/* Left Column: Key Metrics & Chart */}
            <div className="flex flex-col md:col-span-8">
                 {/* Click Activity & Big Chart */}
                 <motion.section className="px-6 py-8 md:p-8 md:bg-white/[0.02] md:border md:border-white/5 md:rounded-2xl" variants={fadeInUp}>
                  <div className="flex flex-col gap-1 mb-6">
                    <div className="flex justify-between items-end">
                      <p className="text-primary/60 text-[10px] font-mono uppercase tracking-[0.2em]">
                        Total Global Clicks
                      </p>
                    </div>
                    {loading ? (
                      <div className="h-12 w-32 bg-white/10 animate-pulse rounded mt-1" />
                    ) : (
                      <p className="text-white text-5xl heading-style tracking-tighter mt-1">
                        {totalClicks.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-primary text-sm">
                        trending_up
                      </span>
                      <p className="text-primary text-[11px] font-mono font-medium">
                        +12.4% <span className="text-white/30 ml-1">/ Last 24h</span>
                      </p>
                    </div>
                  </div>

                  <div className="relative w-full h-[200px] mt-8">
                    <svg className="w-full h-full phosphor-glow overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 150">
                      {/* Fill Gradient */}
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#33E1FF" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#33E1FF" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      
                      <motion.path 
                        d={chartPath} 
                        fill="url(#chartGradient)" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                      />

                      <motion.path 
                        d={linePath} 
                        fill="none" 
                        stroke="#33E1FF" 
                        strokeLinejoin="round" 
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="flex justify-between mt-6 px-1 border-t border-white/5 pt-2">
                      <p className="text-white/30 text-[9px] font-mono uppercase tracking-tighter">00:00</p>
                      <p className="text-white/30 text-[9px] font-mono uppercase tracking-tighter">12:00</p>
                      <p className="text-white/30 text-[9px] font-mono uppercase tracking-tighter">23:59</p>
                    </div>
                  </div>
                </motion.section>

                {/* Sub-Stats Grid */}
                <motion.section className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 md:px-0 mt-4 md:mt-8 pb-10 md:pb-0" variants={fadeInUp}>
                  <div className="glass-node flex flex-col gap-2 rounded-sm border border-primary/30 p-5">
                    <p className="text-primary/60 text-[10px] font-mono uppercase tracking-[0.3em]">GLOBAL CLICKS</p>
                    <div className="flex items-end justify-between">
                      <p className="text-white text-3xl font-mono font-bold tracking-tighter">
                        {loading ? '...' : totalClicks.toLocaleString()}
                      </p>
                      <span className="material-symbols-outlined text-primary/40 text-xl">memory</span>
                    </div>
                  </div>
                  
                  {/* Wrappers to match grid styles on mobile */}
                  <div className="glass-node flex-1 flex flex-col gap-2 rounded-sm border border-primary/30 p-5">
                      <p className="text-primary/60 text-[10px] font-mono uppercase tracking-[0.1em]">GLOBAL SOURCES</p>
                      <p className="text-white text-2xl font-mono font-bold tracking-tighter">
                        {loading ? '...' : uniqueSources.toLocaleString()}
                      </p>
                  </div>
                  {/* Removed Avg Speed Card */}
                </motion.section>
            </div>

            {/* Right Column: Referrals (Desktop Sidebar-style) */}
            <div className="md:col-span-4 flex flex-col">
                <div className="px-6 py-4 md:px-0 md:py-0 flex items-center justify-between md:mb-4">
                  <h3 className="text-white text-xs heading-style tracking-[0.4em]">TOP GLOBAL SOURCES</h3>
                  <div className="h-[1px] flex-1 bg-white/10 ml-6 md:hidden"></div>
                </div>

                <motion.section 
                    className="px-4 md:px-0 space-y-2 flex-1 md:overflow-y-auto custom-scrollbar md:bg-white/5 md:rounded-2xl md:p-4 md:border md:border-white/5" 
                    variants={staggerContainer} 
                    initial="hidden" 
                    animate="visible"
                >
                  {referrals.length === 0 && !loading && (
                     <div className="text-center py-20 text-white/30 text-xs font-mono flex flex-col items-center">
                        <span className="material-symbols-outlined text-3xl mb-2">signal_wifi_off</span>
                        NO DATA AVAILABLE
                     </div>
                  )}
                  
                  {referrals.map((ref, idx) => (
                    <motion.div 
                      key={idx}
                      variants={listItemVariant}
                      className="flex items-center gap-4 px-4 min-h-[64px] py-2 justify-between border border-white/5 rounded-sm bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-primary flex items-center justify-center rounded-sm bg-primary/10 border border-primary/20 shrink-0 size-8">
                          <span className="material-symbols-outlined text-sm">public</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-white text-sm font-bold font-mono truncate max-w-[120px]">{ref.domain || 'Direct'}</p>
                        </div>
                      </div>
                      <p className="text-primary text-sm font-mono font-bold">{ref.count}</p>
                    </motion.div>
                  ))}
                </motion.section>
            </div>

        </div>
      </motion.main>

      <BottomNav />
    </ResponsiveContainer>
  );
}
