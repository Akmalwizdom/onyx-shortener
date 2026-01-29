'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, isValidUrl } from '@/lib/utils';
import { useAccount } from 'wagmi'; // For getting connected address

// Define the Access Policy structure
export type AccessPolicy = {
  type: 'token' | 'nft';
  contractAddress: string;
  minBalance: string;
  chainId: number;
} | null;

interface UrlInputNodeProps {
  onSubmit: (url: string, accessPolicy: AccessPolicy) => void;
  isLoading?: boolean;
  quota?: { remaining: number, limit: number } | null;
  className?: string;
}

export function UrlInputNode({ onSubmit, isLoading = false, quota, className }: UrlInputNodeProps) {
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isGateOpen, setIsGateOpen] = useState(false);
  
  // Gate Configuration State
  const [gateType, setGateType] = useState<'token' | 'nft'>('token');
  const [contractAddress, setContractAddress] = useState('');
  const [minBalance, setMinBalance] = useState('1');

  // Auto-dismiss error
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    let trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    if (!/^https?:\/\//i.test(trimmedUrl)) {
        trimmedUrl = `https://${trimmedUrl}`;
    }

    if (!isValidUrl(trimmedUrl)) {
      setLocalError('Invalid URL format');
      return;
    }

    // Construct Access Policy
    let policy: AccessPolicy = null;
    if (isGateOpen && contractAddress) {
        if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
            setLocalError('Invalid Contract Address');
            return;
        }
        policy = {
            type: gateType,
            contractAddress,
            minBalance,
            chainId: 8453 // Default to Base
        };
    }

    if (!isLoading) {
      onSubmit(trimmedUrl, policy);
    }
  }, [url, isLoading, onSubmit, isGateOpen, gateType, contractAddress, minBalance]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-mono text-primary tracking-tighter">
          INPUT LONG URL
        </span>
        <button 
            type="button"
            onClick={() => setIsGateOpen(!isGateOpen)}
            className={cn(
                "text-[10px] font-mono flex items-center gap-1 transition-colors",
                isGateOpen ? "text-primary" : "text-white/40 hover:text-white"
            )}
        >
            <span className="material-symbols-outlined text-sm">
                {isGateOpen ? 'lock_open' : 'lock'}
            </span>
            {isGateOpen ? 'GATE ACTIVE' : 'ADD GATE'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="contents" noValidate>
        {/* Main URL Input */}
        <div className="relative group">
          <div className={cn(
            'absolute -inset-0.5 rounded-lg blur opacity-30',
            'group-focus-within:opacity-100 transition duration-500',
            localError ? 'bg-error/50' : 'bg-primary/20'
          )} />
          
          <div className={cn(
            "relative flex w-full items-stretch glass-panel rounded-lg overflow-hidden !p-0 transition-colors duration-300",
            localError ? "!border-error" : "!border-primary/30"
          )}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/secret-file"
              disabled={isLoading}
              className="flex w-full min-w-0 flex-1 bg-transparent border-none text-white placeholder:text-primary/30 p-4 text-sm font-mono focus:ring-0 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Gate Configuration Panel */}
        <AnimatePresence>
            {isGateOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex flex-col gap-3">
                        <div className="flex gap-2 mb-1">
                            {/* Type Toggle */}
                            <button
                                type="button"
                                onClick={() => setGateType('token')}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-mono border rounded transition-all",
                                    gateType === 'token' 
                                        ? "bg-primary text-black border-primary font-bold" 
                                        : "bg-transparent text-primary/50 border-primary/20 hover:border-primary/50"
                                )}
                            >
                                ERC-20 TOKEN
                            </button>
                            <button
                                type="button"
                                onClick={() => setGateType('nft')}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-mono border rounded transition-all",
                                    gateType === 'nft' 
                                        ? "bg-primary text-black border-primary font-bold" 
                                        : "bg-transparent text-primary/50 border-primary/20 hover:border-primary/50"
                                )}
                            >
                                NFT (ERC-721)
                            </button>
                        </div>

                        {/* Contract Address */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-primary/60 font-mono block">CONTRACT ADDRESS (BASE)</label>
                            <input 
                                type="text" 
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                placeholder="0x..."
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-primary/50 focus:outline-none"
                            />
                        </div>

                        {/* Min Balance */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-primary/60 font-mono block">MINIMUM BALANCE</label>
                            <input 
                                type="number" 
                                value={minBalance}
                                onChange={(e) => setMinBalance(e.target.value)}
                                placeholder="1"
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-primary/50 focus:outline-none"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Error Display */}
        {localError && (
            <div className="flex items-center gap-2 px-1 text-error">
                <span className="material-symbols-outlined text-sm">error</span>
                <span className="text-xs font-mono">{localError}</span>
            </div>
        )}

        {/* Quota Indicator */}
        {quota && (
            <div className="flex justify-between items-center px-1" data-testid="quota-indicator-home">
                <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">
                    Daily Quota
                </span>
                <span 
                    data-testid="quota-remaining-home"
                    className={cn(
                    "text-[10px] font-mono font-bold tracking-widest",
                    quota.remaining === 0 ? "text-error" : (quota.remaining < 3 ? "text-orange-400" : "text-primary/60")
                )}>
                    {quota.remaining}/{quota.limit} REMAINING
                </span>
            </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed inner-glow"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="font-bold text-sm tracking-[0.3em] font-display">
            {isLoading ? 'WORKING...' : (isGateOpen ? 'CREATE GATED LINK' : 'SHORTEN')}
          </span>
          <span className="material-symbols-outlined ml-2 text-xl">
            {isGateOpen ? 'lock' : 'bolt'}
          </span>
        </motion.button>
      </form>
    </div>
  );
}

export default UrlInputNode;