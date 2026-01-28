/**
 * Utility functions for ONYX URL Shortener
 */

import { nanoid } from 'nanoid';

/**
 * Conditionally join class names together
 * Lightweight alternative to clsx/classnames
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Generate a short, URL-safe slug
 * @param length - Length of the slug (default: 7)
 * @returns Random alphanumeric string
 */
export function generateShortCode(length: number = 7): string {
    return nanoid(length);
}

/**
 * Validate if a string is a valid URL
 * @param url - URL string to validate
 * @returns Boolean indicating validity
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Sanitize URL to prevent open redirect attacks
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
    if (!isValidUrl(url)) return null;

    const parsed = new URL(url);

    // Block javascript: and data: protocols (extra safety)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
    }

    return parsed.toString();
}

/**
 * Format large numbers with K/M suffix
 * @param num - Number to format
 * @returns Formatted string (e.g., "42.5K")
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

/**
 * Format crypto balance with adaptive precision
 * @param balance - The numeric balance
 * @param symbol - Currency symbol (default: 'ETH')
 * @returns Formatted string (e.g., "0.00003 ETH")
 */
export function formatCryptoBalance(balance: number, symbol: string = 'ETH'): string {
    if (balance === 0) return `0 ${symbol}`;

    // For very small balances, provide higher precision (up to 6 decimals)
    if (balance < 0.001) {
        return `${balance.toFixed(6).replace(/\.?0+$/, '')} ${symbol}`;
    }

    // For standard balances, use 4 decimals
    return `${balance.toFixed(4).replace(/\.?0+$/, '')} ${symbol}`;
}

/**
 * Generate full short URL from base and code
 * @param shortCode - The short code
 * @returns Full URL for the shortened link
 */
export function getShortUrl(shortCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/r/${shortCode}`;
}
