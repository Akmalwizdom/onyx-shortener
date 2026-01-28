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
async function checkRateLimit(request: NextRequest): Promise<{ result: any, type: 'daily' | 'minute' | 'none', reset?: number }> {
    // Skip rate limiting in local development to avoid workflow interruption
    if (process.env.NODE_ENV === 'development') {
        return {
            result: {
                success: true,
                limit: 0,
                remaining: 0,
                reset: 0
            },
            type: 'none'
        };
    }

    if (!ratelimitDaily || !ratelimitMinute) {
        return {
            result: {
                success: true,
                limit: 0,
                remaining: 0,
                reset: 0
            },
            type: 'none'
        };
    }
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    const [dailyResult, minuteResult] = await Promise.all([
        ratelimitDaily.limit(ip),
        ratelimitMinute.limit(ip),
    ]);

    if (!dailyResult.success) return { result: dailyResult, type: 'daily', reset: dailyResult.reset };
    if (!minuteResult.success) return { result: minuteResult, type: 'minute', reset: minuteResult.reset };

    if (dailyResult.remaining <= minuteResult.remaining) {
        return { result: dailyResult, type: 'daily', reset: dailyResult.reset };
    } else {
        return { result: minuteResult, type: 'minute', reset: minuteResult.reset };
    }
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
        // 1. Rate Limiting
        const { result, type, reset } = await checkRateLimit(request);
        if (!result.success) {
            return NextResponse.json({
                error: 'Rate limit exceeded.',
                reset: reset // Unix timestamp in ms
            }, { status: 429 });
        }

        const body = await request.json();
        const { url, expiresIn, expiresAt, creatorWallet, accessPolicy } = body;

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
                expiresAt: newUrl.expires_at
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating short URL:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}