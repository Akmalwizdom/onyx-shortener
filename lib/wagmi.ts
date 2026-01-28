'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { base } from 'wagmi/chains';
import { cookieStorage, createStorage } from 'wagmi';

// Get your project ID from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '4abcc2255a21d61437c7a3ec678e99b1';

export const config = getDefaultConfig({
  appName: 'Onyx Protocol',
  projectId,
  chains: [base],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [base.id]: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL?.startsWith('http')
      ? http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
      : http(),
  },
});
