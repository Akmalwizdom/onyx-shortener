'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

function ShareContent() {
  const searchParams = useSearchParams();
  const shortUrl = searchParams.get('short') || 'short.ly/error';
  const originalUrl = searchParams.get('original') || 'https://unknown-source.com';
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API is supported
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'ONYX Short Link',
        text: 'Check out this link I shortened with ONYX:',
        url: shortUrl,
      });
    } catch (err) {
      console.error('Share failed:', err);
      // Fallback to copy if share fails or is cancelled
      // Optional: show a toast here
    }
  };

  return (
    <ResponsiveContainer>
      {/* Mobile Top Navigation Bar (Hidden on Desktop) */}
      <header className="flex md:hidden items-center bg-transparent p-6 pb-2 justify-between z-10">
        <Link href="/" className="text-white flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <h2 className="text-white/60 text-xs font-bold leading-tight tracking-[0.2em] flex-1 text-center uppercase">Link Ready</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex items-center justify-center size-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-xl">settings_input_component</span>
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-3xl font-bold leading-none tracking-tighter italic font-display">
            Shorten Link
          </h1>
          <p className="font-mono text-xs text-primary/40 tracking-widest mt-1">
            SUCCESS
          </p>
        </div>
        <Link href="/" className="text-white flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
        </Link>
      </div>
      
      <motion.main 
        className="px-6 py-8 flex-1 flex flex-col items-center justify-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Success State Header (Mobile Only) */}
        <motion.div className="flex flex-col items-center mb-6 md:hidden" variants={fadeInUp}>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
            <h4 className="text-primary text-[10px] font-bold leading-normal tracking-[0.2em] uppercase">Shortened Successfully</h4>
          </div>
        </motion.div>

        {/* Primary Data Node (Active Result) */}
        <motion.div className="relative mb-12 w-full max-w-[500px]" variants={fadeInUp}>
          {/* Phosphor Pulse Border Container */}
          <div className="phosphor-pulse bg-white/5 backdrop-blur-3xl rounded-xl p-8 flex flex-col items-center justify-center text-center gap-6 overflow-hidden relative border border-white/10">
            {/* Decorative element */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            
            <div className="flex flex-col gap-2 w-full">
              <p className="text-white/40 text-[10px] font-medium tracking-[0.15em] uppercase">Your Short Link</p>
              <p className="lucid-mint-text font-mono text-3xl font-bold leading-tight break-all tracking-tight selection:bg-primary/30 selection:text-white">{shortUrl}</p>
              <p className="text-white/30 text-xs font-normal leading-normal truncate px-4">{originalUrl}</p>
            </div>
            
            <div className="flex w-full gap-3">
              <button 
                onClick={handleCopy}
                className="group flex-1 relative flex items-center justify-center overflow-hidden rounded-lg h-12 bg-primary text-black text-sm font-bold leading-normal tracking-[0.1em] transition-transform active:scale-95 hover:brightness-110 inner-glow"
              >
                <span className="truncate">{copied ? 'COPIED!' : 'COPY'}</span>
                <span className="material-symbols-outlined ml-2 text-lg">content_copy</span>
              </button>

              {canShare && (
                <button 
                  onClick={handleShare}
                  className="group flex-1 relative flex items-center justify-center overflow-hidden rounded-lg h-12 bg-white/10 border border-white/10 text-white text-sm font-bold leading-normal tracking-[0.1em] transition-transform active:scale-95 hover:bg-white/20"
                >
                  <span className="truncate">SHARE</span>
                  <span className="material-symbols-outlined ml-2 text-lg">ios_share</span>
                </button>
              )}
            </div>
            
          </div>
          {/* Shadow Glow */}
          <div className="absolute -z-10 inset-0 blur-3xl bg-primary/10 rounded-full opacity-50"></div>
        </motion.div>

      </motion.main>
      
      {/* Fixed Bottom Action (Reachability) */}
      <div className="fixed bottom-10 left-0 w-full px-6 flex justify-center z-50 md:sticky md:bottom-8 md:bg-transparent">
        <Link 
          href="/"
          className="bg-black/80 hover:bg-black transition-colors backdrop-blur-md border border-white/10 rounded-full px-8 py-3 flex items-center gap-3 shadow-lg"
        >
          <span className="material-symbols-outlined text-primary text-sm">add</span>
          <span className="text-white/80 text-[11px] font-bold tracking-[0.2em] uppercase">Shorten Another</span>
        </Link>
      </div>

    </ResponsiveContainer>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-primary font-mono text-xs tracking-widest">LOADING...</div>}>
      <ShareContent />
    </Suspense>
  );
}
