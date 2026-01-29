'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { useState } from 'react';
import {
  Address,
  Avatar,
  Name,
} from '@coinbase/onchainkit/identity';
import { DisconnectConfirmModal } from './DisconnectConfirmModal';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { disconnect } = useDisconnect();
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  const navItems = [
    { icon: 'dashboard', label: 'DASHBOARD', path: '/' },
    { icon: 'history', label: 'HISTORY', path: '/history' },
    { icon: 'analytics', label: 'ANALYTICS', path: '/analytics' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 z-50 items-center justify-between px-8"
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-primary text-2xl group-hover:text-white transition-colors">
              terminal
            </span>
            <h1 className="text-primary font-mono text-sm tracking-[0.2em] font-bold group-hover:text-white transition-colors">
              XYNO
            </h1>
        </Link>

        {/* CENTER NAV */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  "relative px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300",
                  isActive ? "text-primary bg-primary/5" : "text-white/40 hover:text-white"
                )}
              >
                <span className={cn(
                  "material-symbols-outlined text-[18px]",
                  isActive ? "fill-current" : ""
                )}>
                  {item.icon}
                </span>
                <span className="text-xs font-mono font-bold tracking-wider">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-full border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          <ConnectButton.Custom>
            {(
              {
                account,
                chain,
                openConnectModal,
                mounted,
              }
            ) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        /* Only this state should use the cyber-wallet-container styles */
                        <div className="cyber-wallet-container">
                          <button 
                            onClick={openConnectModal} 
                            className="cyber-wallet-btn flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-all font-bold"
                          >
                            Connect Wallet
                          </button>
                        </div>
                      );
                    }

                    return (
                        <div className="flex items-center gap-3">
                            {/* Profile Card - Isolated from 'cyber-wallet-container' to avoid CSS conflicts */}
                            <div className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 bg-white/[0.04] border border-white/10 rounded-full group hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-default shadow-lg shadow-black/20">
                                <span className="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
                                <div className="flex flex-col">
                                    <Name 
                                        address={account.address as `0x${string}`} 
                                        className="text-[12px] font-mono font-bold !text-white leading-none tracking-tight" 
                                    />
                                </div>
                                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsDisconnectModalOpen(true);
                                    }}
                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-error/10 text-white/10 hover:text-error transition-all group/logout-btn"
                                    title="Disconnect Wallet"
                                >
                                    <span className="material-symbols-outlined text-[18px] notranslate !font-normal">power_settings_new</span>
                                </button>
                            </div>
                        </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </motion.nav>

      <DisconnectConfirmModal 
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={() => {
            disconnect();
            setIsDisconnectModalOpen(false);
        }}
      />
    </>
  );
}
