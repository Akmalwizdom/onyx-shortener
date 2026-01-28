'use client';

import Link from 'next/link';
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

interface TopNavProps {
  className?: string;
  hideLogo?: boolean;
}

export function TopNav({ className, hideLogo = false }: TopNavProps) {
  const { disconnect } = useDisconnect();

  return (
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
            ONYX
          </h2>
        </Link>
      ) : (
        <div /> 
      )}

      {/* Wallet Connection */}
      <div className="flex items-center gap-4">
        <div className="cyber-wallet-container">
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
                        <button 
                          onClick={openConnectModal} 
                          className="cyber-wallet-btn flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-2 text-[10px] font-mono uppercase tracking-widest hover:bg-primary/20 transition-all"
                        >
                          Connect
                        </button>
                      );
                    }

                    return (
                        <Wallet>
                            <ConnectWallet className="cyber-wallet-btn !bg-transparent !border-primary/20 hover:!border-primary/50 !rounded-none !px-3 !py-2 !transition-colors !min-w-0 !gap-2 !flex !items-center !h-auto">
                                <Avatar className="h-4 w-4" address={account.address as `0x${string}`} />
                                <Name address={account.address as `0x${string}`} className="text-[10px] font-mono !text-primary truncate max-w-[80px]" />
                            </ConnectWallet>
                            
                            <WalletDropdown className="!bg-[#050505] !backdrop-blur-2xl !rounded-lg !mt-3 !min-w-[240px] !shadow-2xl !shadow-primary/5 border-none">
                                <Identity className="!px-5 !py-4 !bg-transparent border-none" hasCopyAddressOnClick>
                                    <div className="flex flex-col">
                                      <Name address={account.address as `0x${string}`} className="!text-white font-mono font-bold text-xs" />
                                      <Address address={account.address as `0x${string}`} className="!text-white/40 font-mono text-[9px] !mt-1" />
                                    </div>
                                </Identity>

                                <div className="mx-5 mb-5 p-3.5 rounded bg-primary/[0.03] border border-primary/10 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/30"></div>
                                  <BalanceDisplay address={account.address as `0x${string}`} />
                                </div>

                                <button
                                    type="button"
                                    className="group flex w-full items-center gap-3 px-5 py-3.5 text-[10px] font-mono font-bold text-error/70 hover:text-error hover:bg-error/5 transition-all border-t border-white/5"
                                    onClick={() => disconnect()}
                                >
                                    <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">logout</span>
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
    </div>
  );
}

function BalanceDisplay({ address }: { address: `0x${string}` }) {
  const { data: balance } = useBalance({
    address,
  });

  return (
    <div className="flex flex-col">
      <span className="text-[8px] text-white/30 font-mono uppercase tracking-[0.2em] leading-tight mb-0.5">Current Balance</span>
      <span className="text-sm font-mono font-bold text-primary tracking-tight">
        {balance ? formatCryptoBalance(Number(balance.formatted), balance.symbol) : '0.00 ETH'}
      </span>
    </div>
  );
}

export default TopNav;
