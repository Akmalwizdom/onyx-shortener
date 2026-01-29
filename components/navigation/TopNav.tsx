'use client';

import Link from 'next/link';
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

interface TopNavProps {
  className?: string;
  hideLogo?: boolean;
}

export function TopNav({ className, hideLogo = false }: TopNavProps) {
  const { disconnect } = useDisconnect();
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'flex items-center p-6 justify-between z-10 relative', 
          className
        )}
      >
        {/* Logo & Branding */}
        {!hideLogo ? (
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              terminal
            </span>
            <h2 className="text-primary font-mono text-sm tracking-[0.2em] font-bold">
              XYNO
            </h2>
          </Link>
        ) : (
          <div /> 
        )}

        {/* Wallet Connection */}
        <div className="flex items-center gap-4">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              mounted,
            }) => {
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
                        <div className="cyber-wallet-container">
                          <button 
                            onClick={openConnectModal} 
                            className="cyber-wallet-btn flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-2 text-[10px] font-mono uppercase tracking-widest hover:bg-primary/20 transition-all font-bold"
                          >
                            Connect Wallet
                          </button>
                        </div>
                      );
                    }

                    return (
                        <div className="flex items-center gap-2">
                            {/* Compact Mobile Profile Card - Isolated from CSS conflicts */}
                            <div className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 bg-white/[0.04] border border-white/10 rounded-full shadow-lg">
                                <span className="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
                                <div className="flex flex-col">
                                    <Name 
                                      address={account.address as `0x${string}`} 
                                      className="text-[12px] font-mono font-bold !text-white leading-none tracking-tight truncate max-w-[80px]" 
                                    />
                                </div>
                                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                                <button 
                                    onClick={() => setIsDisconnectModalOpen(true)}
                                    className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-error/10 text-white/10 hover:text-error transition-all"
                                >
                                    <span className="material-symbols-outlined text-[16px] notranslate !font-normal">power_settings_new</span>
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
      </div>

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

export default TopNav;
