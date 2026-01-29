'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect, WalletDropdownLink } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Identity, Address, EthBalance } from '@coinbase/onchainkit/identity';
import { motion } from 'framer-motion';
import { CyberLoading } from '@/components/url/CyberLoading';

// Types
type LinkDetails = {
    shortCode: string;
    title?: string;
    accessPolicy: {
        type: 'token' | 'nft';
        contractAddress: string;
        minBalance: string;
    };
};

export default function UnlockPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { address, isConnected } = useAccount();
    
    const [details, setDetails] = useState<LinkDetails | null>(null);
    const [status, setStatus] = useState<'LOADING' | 'LOCKED' | 'VERIFYING' | 'GRANTED' | 'DENIED' | 'ERROR'>('LOADING');
    const [errorMessage, setErrorMessage] = useState('');

    // 1. Fetch Link Details on Mount
    useEffect(() => {
        fetch(`/api/link-details?slug=${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setStatus('ERROR');
                    setErrorMessage(data.error);
                } else {
                    setDetails(data.data);
                    setStatus('LOCKED');
                }
            })
            .catch(() => setStatus('ERROR'));
    }, [slug]);

    const handleUnlock = useCallback(async () => {
        if (!address || !details) return;

        setStatus('VERIFYING');
        try {
            const res = await fetch('/api/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, userAddress: address })
            });
            
            const data = await res.json();

            if (data.success && data.originalUrl) {
                setStatus('GRANTED');
                setTimeout(() => {
                    window.location.href = data.originalUrl;
                }, 1500); // 1.5s delay to show success animation
            } else {
                setStatus('DENIED');
                setErrorMessage(data.error || 'Access Denied');
            }
        } catch (err) {
            setStatus('ERROR');
            setErrorMessage('Network Error');
        }
    }, [address, details, slug]);

    // 2. Auto-Verify when Wallet Connects
    useEffect(() => {
        if (isConnected && address && details && status === 'LOCKED') {
            handleUnlock();
        }
    }, [isConnected, address, details, status, handleUnlock]);

    if (status === 'LOADING') {
        return <div className="min-h-screen bg-black flex items-center justify-center"><CyberLoading /></div>;
    }

    if (status === 'ERROR') {
        return (
             <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-mono">
                <span className="material-symbols-outlined text-6xl text-error mb-4">broken_image</span>
                <h1 className="text-2xl mb-2">LINK INVALID</h1>
                <p className="text-white/50">{errorMessage}</p>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center text-center relative z-10"
            >
                {/* Status Icon */}
                <div className="mb-6 relative">
                    {status === 'GRANTED' ? (
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary text-primary"
                        >
                            <span className="material-symbols-outlined text-4xl">lock_open</span>
                        </motion.div>
                    ) : status === 'DENIED' ? (
                        <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center border border-error text-error">
                            <span className="material-symbols-outlined text-4xl">lock</span>
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-white/50">
                            <span className="material-symbols-outlined text-4xl">lock</span>
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold font-display text-white mb-2">
                    {status === 'GRANTED' ? 'ACCESS GRANTED' : (details?.title || 'RESTRICTED CONTENT')}
                </h1>
                
                <p className="text-sm font-mono text-white/50 mb-8">
                    {status === 'GRANTED' ? 'Redirecting you now...' : 
                     status === 'DENIED' ? errorMessage :
                     'This link is protected by Xyno Protocol.'}
                </p>

                {/* Requirement Box */}
                {status !== 'GRANTED' && details?.accessPolicy && (
                    <div className="w-full bg-black/50 border border-white/10 rounded-xl p-4 mb-8">
                        <p className="text-[10px] text-primary font-mono tracking-widest mb-2">ACCESS REQUIREMENT</p>
                        <div className="flex items-center justify-between">
                             <div className="flex flex-col items-start">
                                <span className="text-lg font-bold text-white">
                                    {details.accessPolicy.minBalance} {details.accessPolicy.type === 'nft' ? 'NFT' : 'TOKEN'}
                                </span>
                                <span className="text-[10px] text-white/30 truncate max-w-[200px]">
                                    {details.accessPolicy.contractAddress}
                                </span>
                             </div>
                             <span className="material-symbols-outlined text-white/20">verified_user</span>
                        </div>
                    </div>
                )}

                {/* Action Area */}
                {status === 'GRANTED' ? (
                    <div className="h-12 flex items-center gap-2 text-primary font-mono text-xs">
                        <span className="size-2 bg-primary rounded-full animate-ping"/>
                        ENTERING SECURE CHANNEL...
                    </div>
                ) : (
                    <div className="w-full">
                        {!isConnected ? (
                             <ConnectButton.Custom>
                                {({ openConnectModal }) => (
                                    <button 
                                        onClick={openConnectModal}
                                        className="w-full justify-center bg-white text-black font-bold hover:bg-gray-200 h-12 rounded-xl flex items-center gap-2 transition-all"
                                    >
                                        <span className="material-symbols-outlined">wallet</span>
                                        CONNECT WALLET TO UNLOCK
                                    </button>
                                )}
                             </ConnectButton.Custom>
                        ) : (
                            <div className="flex flex-col gap-3 w-full">
                                {status === 'DENIED' ? (
                                    <button onClick={handleUnlock} className="w-full h-12 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl font-mono text-sm">
                                        RETRY CHECK
                                    </button>
                                ) : (
                                    <div className="h-12 flex items-center justify-center gap-2 text-white/50 font-mono text-xs">
                                        <span className="size-2 bg-white/50 rounded-full animate-pulse"/>
                                        VERIFYING OWNERSHIP...
                                    </div>
                                )}
                                
                                {/* Wallet Info (Small) */}
                                <div className="flex items-center justify-center gap-2 mt-2 opacity-50">
                                    <span className="text-[10px] text-white">Connected as</span>
                                    <Identity className="!bg-transparent !p-0">
                                        <Name className="!text-[10px] !text-primary" />
                                    </Identity>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
