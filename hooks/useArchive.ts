import useSWRInfinite from 'swr/infinite';
import { getHistoryIds, clearLocalHistory } from '@/utils/storage';

export type Link = {
    id: string;
    shortCode: string;
    originalUrl: string;
    createdAt: string;
    expiresAt: string | null;
    clickCount: number;
    isActive: boolean;
    shortUrl: string;
};

type ApiResponse = {
    success: boolean;
    data: Link[];
    error?: string;
};

// SWR Fetcher that handles both (url, body) spread arguments and [url, body] single argument
// usage of 'any' here is to catch the variable SWR behavior safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = async (arg: any, ...rest: any[]) => {
    let url: string;
    let body: Record<string, unknown> | undefined;

    if (Array.isArray(arg)) {
        // SWR passed the key as an array (single argument)
        [url, body] = arg;
    } else {
        // SWR spread the arguments
        url = arg;
        body = rest[0];
    }

    const method = body ? 'POST' : 'GET';
    const options: RequestInit = body ? {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    } : {};

    // Ensure we don't accidentally fetch a comma-separated string if logic failed
    if (url.includes('[object Object]')) {
        console.error('CRITICAL: Malformed URL detected in fetcher:', url);
        throw new Error('Malformed URL request');
    }

    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to fetch data');
    }
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'API reported failure');
    return json;
};

export function useArchive(filter: 'recent' | 'active' | 'expired' = 'recent', limit: number = 20) {
    const getKey = (pageIndex: number, previousPageData: ApiResponse) => {
        if (previousPageData && !previousPageData.data.length) return null; // Reached the end

        // [PRIVACY] Only fetch links that belong to this user (from local storage)
        const localIds = getHistoryIds();
        if (localIds.length === 0) return null; // No history locally, don't fetch anything

        // Pass arguments for POST request
        return ['/api/links', {
            filter,
            page: pageIndex + 1,
            limit,
            ids: localIds
        }];
    };

    const { data, error, isLoading, isValidating, mutate, size, setSize } = useSWRInfinite<ApiResponse>(
        getKey,

        fetcher,
        {
            revalidateFirstPage: true, // Always recheck on mount in case local storage changed
            keepPreviousData: true,
            revalidateOnFocus: true,
        }
    );

    const links = data ? data.flatMap(page => page.data) : [];

    // If we have no local IDs, we are not loading, just empty.
    const hasLocalHistory = typeof window !== 'undefined' && getHistoryIds().length > 0;
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
    const isEmpty = !hasLocalHistory || (data?.[0]?.data?.length === 0);
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < limit);

    const clearArchive = async () => {
        try {
            // Clear local storage first
            clearLocalHistory();

            // We don't necessarily need to delete from DB if we want to keep them alive but just "forget" them from history.
            // But if user wants to delete logic, we need to pass IDs to delete.
            // Current API assumes "Bulk Delete by Filter".
            // Implementation Decision: For "Private History", "Clear" usually means "Clear My History List" (Forget).
            // It does NOT necessarily mean "Delete from Database" (destroy link for everyone).
            // Let's make "Clear All" -> Forget Local History.

            mutate([], false); // Clear SWR cache
            return true;
        } catch (e) {
            console.error("Failed to clear archive", e);
            return false;
        }
    };

    return {
        links,
        isLoading,
        isLoadingMore,
        isReachingEnd,
        size,
        setSize,
        isValidating,
        isError: error,
        mutate,
        clearArchive
    };
}
