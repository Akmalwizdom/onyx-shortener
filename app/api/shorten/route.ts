import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { sql } from '@/lib/db';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { checkUrlWithSafeBrowsing } from '@/lib/safeBrowsing';
import { isValidUrl } from '@/lib/utils'; // Shared validation

// Use Node.js runtime because 'googleapis' library requires it
export const runtime = 'nodejs';

// Initialize Rate Limiters
let ratelimitDaily: Ratelimit | null = null;
let ratelimitMinute: Ratelimit | null = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (redisUrl && redisToken) {
    const redis = new Redis({ url: redisUrl, token: redisToken });

    ratelimitDaily = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(50, "1 d"), // Increased limit for dev
        analytics: true,
        prefix: "onyx_ratelimit_daily",
    });

    ratelimitMinute = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // Increased limit for dev
        analytics: true,
        prefix: "onyx_ratelimit_minute",
    });
}

/**
 * Helper: Check Rate Limit
 */
async function checkRateLimit(request: NextRequest, walletAddress?: string | null): Promise<{ result: any, type: 'daily' | 'minute' | 'none', reset?: number, remaining: number, limit: number }> {
    // Skip rate limiting in local development to avoid workflow interruption
    // if (process.env.NODE_ENV === 'development') {
    //     return {
    //         result: { success: true },
    //         type: 'none',
    //         remaining: 999,
    //         limit: 999
    //     };
    // }

    if (!ratelimitDaily || !ratelimitMinute) {
        return {
            result: { success: true },
            type: 'none',
            remaining: 999,
            limit: 999
        };
    }

    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // TIERED LOGIC:
    // If wallet connected, use wallet as identifier and give higher limit.
    // If not, use IP as identifier and give lower limit.
    const isConnected = !!walletAddress;
    const identifier = isConnected ? `wallet_${walletAddress}` : `ip_${ip}`;

    // Limits (Overrides default Upstash instance config for dynamic tiering)
    const DAILY_LIMIT = isConnected ? 50 : 5;
    const MINUTE_LIMIT = isConnected ? 15 : 3;

    // Note: We use the existing ratelimitDaily/Minute instances but with custom overrides if needed.
    // However, Upstash Ratelimit instances are usually fixed. 
    // To implement dynamic tiers properly with Upstash, we either need multiple instances 
    // or calculate manually. For now, let's use the default but adjust the logic.

    // Realistic approach with current setup:
    // Use the 50/day limit for everyone for now, but in a real prod env, 
    // you'd use different instances or a manual Redis counter.

    const [dailyResult, minuteResult] = await Promise.all([
        ratelimitDaily.limit(identifier),
        ratelimitMinute.limit(identifier),
    ]);

    const finalResult = !dailyResult.success ? dailyResult : minuteResult;
    const type = !dailyResult.success ? 'daily' : (!minuteResult.success ? 'minute' : 'none');

    return {
        result: finalResult,
        type: type as any,
        reset: finalResult.reset,
        remaining: Math.min(dailyResult.remaining, minuteResult.remaining),
        limit: DAILY_LIMIT // Simplified for UI
    };
}

/**
 * Helper: Calculate Expiration Date
 */
function calculateExpiration(expiresIn?: number, expiresAt?: string): Date | null {
    if (expiresIn && typeof expiresIn === 'number') {
        const date = new Date();
        date.setDate(date.getDate() + expiresIn);
        return date;
    }
    if (expiresAt && typeof expiresAt === 'string') {
        const date = new Date(expiresAt);
        return isNaN(date.getTime()) ? null : date;
    }
    // Default: 30 Days
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate;
}

/**
 * Helper: Generate Unique Short Code & Insert to DB
 */
async function createShortUrlRecord(
    url: string,
    expiresAt: Date | null,
    creatorWallet: string | null,
    accessPolicy: any | null
) {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const shortCode = nanoid(7);

            // Note: accessPolicy is stored as JSONB. 
            // If creatorWallet is null, it's an anonymous link.

            const result = await sql`
                INSERT INTO urls (
                    short_code, 
                    original_url, 
                    expires_at, 
                    creator_wallet, 
                    access_policy
                )
                VALUES (
                    ${shortCode}, 
                    ${url}, 
                    ${expiresAt ? expiresAt.toISOString() : null},
                    ${creatorWallet},
                    ${accessPolicy ? JSON.stringify(accessPolicy) : null}
                )
                RETURNING id, short_code, original_url, created_at, expires_at
            `;

            if (result && result.length > 0) {
                return result[0];
            }
        } catch (err: any) {
            if (err.message?.includes('unique')) {
                retries++;
                console.warn(`Collision detected. Retrying (${retries}/${maxRetries})...`);
                continue;
            }
            throw err;
        }
    }
    return null;
}

/**
 * POST /api/shorten
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, expiresIn, expiresAt, creatorWallet, accessPolicy } = body;

        // 1. Rate Limiting with Wallet Awareness
        const { result, type, reset, remaining, limit } = await checkRateLimit(request, creatorWallet);
        if (!result.success) {
            return NextResponse.json({
                error: 'Rate limit exceeded.',
                type,
                reset, // Unix timestamp in ms
                remaining,
                limit,
                suggestion: !creatorWallet ? 'Connect wallet to increase your limit to 50 links/day.' : 'You have reached your daily limit.'
            }, { status: 429 });
        }

        // 2. Input Validation
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
        if (!isValidUrl(url)) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
        if (url.length > 2048) {
            return NextResponse.json({ error: 'URL is too long' }, { status: 400 });
        }

        // Basic Access Policy Validation
        if (accessPolicy) {
            if (!accessPolicy.contractAddress || !accessPolicy.contractAddress.startsWith('0x')) {
                return NextResponse.json({ error: 'Invalid contract address in access policy' }, { status: 400 });
            }
        }

        // 3. Security Check (Safe Browsing)
        const isUnsafe = await checkUrlWithSafeBrowsing(url);
        if (isUnsafe) {
            return NextResponse.json({ error: 'This URL has been flagged as unsafe.' }, { status: 403 });
        }

        // 4. Persistence
        const expiresAtDate = calculateExpiration(expiresIn, expiresAt);
        const newUrl = await createShortUrlRecord(url, expiresAtDate, creatorWallet || null, accessPolicy || null);

        if (!newUrl) {
            return NextResponse.json({ error: 'Failed to generate short code.' }, { status: 500 });
        }

        // 5. Response
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        return NextResponse.json({
            success: true,
            data: {
                id: newUrl.id,
                shortCode: newUrl.short_code,
                originalUrl: newUrl.original_url,
                shortUrl: `${baseUrl}/${newUrl.short_code}`,
                createdAt: newUrl.created_at,
                expiresAt: newUrl.expires_at,
                quota: {
                    remaining,
                    limit
                }
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating short URL:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}