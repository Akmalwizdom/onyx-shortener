/**
 * utility to manage User Link History in LocalStorage.
 * This ensures "Private History" without a login system.
 */

const STORAGE_KEY = 'ONYX_USER_HISTORY';

export function saveLinkToHistory(id: string) {
    if (typeof window === 'undefined') return;

    try {
        const current = getHistoryIds();
        // Prevent duplicates and keep most recent at top (unshift)
        const newHistory = [id, ...current.filter(existingId => existingId !== id)];

        // Optional: Limit history size (e.g., 500 items max to prevent storage overflow)
        const trimmedHistory = newHistory.slice(0, 500);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error('Failed to save link to history:', error);
    }
}

export function getHistoryIds(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get history IDs:', error);
        return [];
    }
}

export function clearLocalHistory() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

export function removeLinkFromHistory(id: string) {
    if (typeof window === 'undefined') return;
    try {
        const current = getHistoryIds();
        const newHistory = current.filter(existingId => existingId !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
        console.error('Failed to remove link from history:', error);
    }
}
