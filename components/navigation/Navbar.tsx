'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn, formatCryptoBalance } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect, useBalance } from 'wagmi';
import { 
  Wallet, 
  ConnectWallet,
  WalletDropdown, 
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { disconnect } = useDisconnect();

  const navItems = [
    { icon: 'dashboard', label: 'DASHBOARD', path: '/' },
    { icon: 'history', label: 'HISTORY', path: '/history' },
    { icon: 'analytics', label: 'ANALYTICS', path: '/analytics' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 z-50 items-center justify-between px-8"
    >
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative overflow-hidden">
            <span className="material-symbols-outlined text-primary text-lg animate-pulse-slow">bolt</span>
            <div className="absolute inset-0 bg-primary/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
        </div>
        <div className="flex flex-col">
            <h1 className="text-white font-bold tracking-tighter italic font-display leading-none">
            ONYX<span className="text-primary">.APP</span>
            </h1>
        </div>
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
        <div className="cyber-wallet-container">
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
                        <button 
                          onClick={openConnectModal} 
                          className="cyber-wallet-btn flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-all"
                        >
                          Connect
                        </button>
                      );
                    }

                    return (
                        <Wallet>
                            <ConnectWallet className="cyber-wallet-btn !bg-transparent !border-primary/20 hover:!border-primary/50 !rounded-none !px-4 !py-2 !transition-colors !min-w-0 !gap-2 !flex !items-center">
                                <Avatar className="h-5 w-5" address={account.address as `0x${string}`} />
                                <Name address={account.address as `0x${string}`} className="text-xs font-mono !text-primary" />
                            </ConnectWallet>
                            
                            <WalletDropdown className="!bg-[#050505] !backdrop-blur-2xl !rounded-lg !mt-3 !min-w-[260px] !shadow-2xl !shadow-primary/5 border-none">
                              <div className="relative group/identity">
                                <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover/identity:opacity-100 transition-opacity"></div>
                                <Identity className="!px-5 !py-4 !bg-transparent border-none" hasCopyAddressOnClick>
                                    <div className="flex flex-col">
                                      <Name address={account.address as `0x${string}`} className="!text-white font-mono font-bold" />
                                      <Address address={account.address as `0x${string}`} className="!text-white/40 font-mono text-[10px] !mt-1" />
                                    </div>
                                </Identity>
                              </div>
                              
                              <div className="mx-5 mb-5 p-4 rounded bg-primary/[0.03] border border-primary/10 relative overflow-hidden group/balance">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/30"></div>
                                <BalanceDisplay address={account.address as `0x${string}`} />
                              </div>
                              
                              <button
                                  type="button"
                                  className="group flex w-full items-center gap-3 px-5 py-4 text-[11px] font-mono font-bold text-error/70 hover:text-error hover:bg-error/5 transition-all border-t border-white/5"
                                  onClick={() => disconnect()}
                              >
                                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">logout</span>
                                  <span className="uppercase tracking-[0.2em]">Disconnect</span>
                              </button>
                            </WalletDropdown>
                        </Wallet>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </motion.nav>
  );
}

function BalanceDisplay({ address }: { address: `0x${string}` }) {
  const { data: balance } = useBalance({
    address,
  });

  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-white/30 font-mono uppercase tracking-[0.2em] leading-tight mb-1">Current Balance</span>
      <span className="text-lg font-mono font-bold text-primary tracking-tight">
        {balance ? formatCryptoBalance(Number(balance.formatted), balance.symbol) : '0.00 ETH'}
      </span>
    </div>
  );
}
