'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { saveLinkToHistory } from '@/utils/storage';

// Define the policy type locally or import from a shared types file
export type AccessPolicy = {
    type: 'token' | 'nft';
    contractAddress: string;
    minBalance: string;
    chainId: number;
} | null;

export type UrlShortenerState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

interface ShortenedUrl {
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    createdAt: Date;
}

interface UseUrlShortenerResult {
    state: UrlShortenerState;
    shortUrl: ShortenedUrl | null;
    error: string | null;
    errorCode: string | number | null;
    resetTime: number | null;
    quota: { remaining: number, limit: number } | null;
    submit: (url: string, accessPolicy?: AccessPolicy) => Promise<void>;
    retry: () => void;
    reset: () => void;
}

export function useUrlShortener(): UseUrlShortenerResult {
    const [state, setState] = useState<UrlShortenerState>('IDLE');
    const [shortUrl, setShortUrl] = useState<ShortenedUrl | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | number | null>(null);
    const [resetTime, setResetTime] = useState<number | null>(null);
    const [quota, setQuota] = useState<{ remaining: number, limit: number } | null>(null);

    // Store last submission for retry
    const [lastSubmission, setLastSubmission] = useState<{ url: string, policy?: AccessPolicy } | null>(null);

    // Get connected wallet
    const { address } = useAccount();

    const submit = useCallback(async (url: string, accessPolicy?: AccessPolicy) => {
        setLastSubmission({ url, policy: accessPolicy });
        setState('LOADING');
        setError(null);
        setErrorCode(null);
        setResetTime(null);

        try {
            const payload = {
                url,
                creatorWallet: address, // Send wallet address if connected
                accessPolicy // Send gate config if exists
            };

            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorCode(response.status);
                if (response.status === 429) {
                    if (data.reset) setResetTime(data.reset);
                    if (data.remaining !== undefined) {
                        setQuota({ remaining: data.remaining, limit: data.limit });
                    }
                }
                throw new Error(data.error || 'Failed to shorten URL');
            }

            if (!data.success || !data.data) {
                throw new Error('Invalid response from server');
            }

            setShortUrl({
                shortCode: data.data.shortCode,
                shortUrl: data.data.shortUrl,
                originalUrl: data.data.originalUrl,
                createdAt: new Date(data.data.createdAt),
            });

            if (data.data.quota) {
                setQuota(data.data.quota);
            }

            // Save to local private history
            if (data.data.id) {
                saveLinkToHistory(data.data.id);
            }

            setState('SUCCESS');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            setState('ERROR');
        }
    }, [address]);

    const reset = useCallback(() => {
        setState('IDLE');
        setShortUrl(null);
        setError(null);
        setErrorCode(null);
        setResetTime(null);
    }, []);

    const retry = useCallback(() => {
        if (lastSubmission) {
            submit(lastSubmission.url, lastSubmission.policy);
        } else {
            reset();
        }
    }, [lastSubmission, submit, reset]);

    return {
        state,
        shortUrl,
        error,
        errorCode,
        resetTime,
        quota,
        submit,
        retry,
        reset,
    };
}

export default useUrlShortener;