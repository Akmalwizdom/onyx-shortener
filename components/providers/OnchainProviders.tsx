'use client';

import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';

import { OnchainKitProvider } from '@coinbase/onchainkit'; 
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { WagmiProvider } from 'wagmi'; 
import { base } from 'wagmi/chains'; 
import { config } from '@/lib/wagmi'; 
import { onyxRainbowTheme } from '@/lib/rainbowKitTheme';
import { type ReactNode, useState, useEffect } from 'react';

export function OnchainProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Professional Error Handling: Suppress known third-party "noise" (e.g., ad-blocker fetch failures)
    // without masking critical application errors.
    const IGNORED_ERRORS = [
      'Analytics SDK',
      'cca-lite',
      'Error sending analytics',
      'api.developer.coinbase.com',
      'Failed to load resource',
      'net::ERR_CONNECTION_REFUSED'
    ];

    const originalError = console.error;
    const originalWarn = console.warn;

    const shouldSuppress = (args: any[]) => {
      const msg = args.map(arg => String(arg)).join(' ');
      return IGNORED_ERRORS.some(errorStr => msg.includes(errorStr));
    };

    // In production, we are more aggressive with suppression to keep a clean console for users.
    // In development, we still suppress pure noise but could log a minimal hint if desired.
    const isProd = process.env.NODE_ENV === 'production';

    console.error = (...args) => {
      if (shouldSuppress(args)) {
        // Log a very clean, one-liner hint in dev instead of a full stack trace if desired
        if (!isProd) {
          // originalError.apply(console, ['[Xyno] Suppressed 3rd-party noise:', args[0]]);
        }
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      if (shouldSuppress(args)) return;
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={onyxRainbowTheme}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
            config={{ analytics: false }}
          >
            {children}
          </OnchainKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
