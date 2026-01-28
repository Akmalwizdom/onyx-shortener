'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { base } from 'wagmi/chains';
import { cookieStorage, createStorage } from 'wagmi';

// Get your project ID from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Onyx Protocol',
  projectId,
  chains: [base],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL?.startsWith('http')
      ? http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
      : http(),
  },
});
