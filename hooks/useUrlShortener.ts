'use client';

import { useState, useCallback } from 'react';

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
    submit: (url: string) => Promise<void>;
    retry: () => void;
    reset: () => void;
}

/**
 * Custom hook for managing URL shortening state machine.
 * 
 * State transitions:
 * IDLE --submit--> LOADING --success--> SUCCESS --reset--> IDLE
 *                          |--error----> ERROR --retry--> IDLE
 */
import { saveLinkToHistory } from '@/utils/storage';

export function useUrlShortener(): UseUrlShortenerResult {
    const [state, setState] = useState<UrlShortenerState>('IDLE');
    const [shortUrl, setShortUrl] = useState<ShortenedUrl | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUrl, setLastUrl] = useState<string>('');

    const submit = useCallback(async (url: string) => {
        setLastUrl(url);
        setState('LOADING');
        setError(null);

        try {
            // Call API directly without artificial delay
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
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

            // Save to local private history
            if (data.data.id) {
                saveLinkToHistory(data.data.id);
            }

            setState('SUCCESS');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            setState('ERROR');
        }
    }, []);

    const reset = useCallback(() => {
        setState('IDLE');
        setShortUrl(null);
        setError(null);
    }, []);

    const retry = useCallback(() => {
        if (lastUrl) {
            submit(lastUrl);
        } else {
            reset();
        }
    }, [lastUrl, submit, reset]);

    return {
        state,
        shortUrl,
        error,
        submit,
        retry,
        reset,
    };
}

export default useUrlShortener;
