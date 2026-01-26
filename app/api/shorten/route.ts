import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { sql } from '@/lib/db';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { checkUrlWithSafeBrowsing } from '@/lib/safeBrowsing';
import { isValidUrl } from '@/lib/utils'; // Shared validation

// Use Node.js runtime because 'googleapis' library requires it
export const runtime = 'nodejs';

// Initialize Rate Limiter
let ratelimit: Ratelimit | null = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (redisUrl && redisToken) {
    ratelimit = new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(20, "1 d"), // 20 requests per day (Public WiFi Friendly)
        analytics: true,
        prefix: "xyno_shortener_ratelimit",
    });
}

/**
 * Helper: Check Rate Limit
 */
async function checkRateLimit(request: NextRequest) {
    if (!ratelimit) {
        return {
            success: true,
            limit: 0,
            remaining: 0,
            reset: 0
        };
    }
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    return await ratelimit.limit(ip);
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
async function createShortUrlRecord(url: string, expiresAt: Date | null) {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const shortCode = nanoid(7);
            const result = await sql`
                INSERT INTO urls (short_code, original_url, expires_at)
                VALUES (${shortCode}, ${url}, ${expiresAt ? expiresAt.toISOString() : null})
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
 * Creates a short URL from the provided original URL
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limiting
        const { success, limit, reset, remaining } = await checkRateLimit(request);
        if (!success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429, headers: {
                        'X-RateLimit-Limit': limit!.toString(),
                        'X-RateLimit-Remaining': remaining!.toString(),
                        'X-RateLimit-Reset': reset!.toString(),
                    }
                }
            );
        }

        const body = await request.json();
        const { url, expiresIn, expiresAt } = body;

        // 2. Input Validation
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required and must be a string' }, { status: 400 });
        }

        if (!isValidUrl(url)) {
            return NextResponse.json({ error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL.' }, { status: 400 });
        }

        if (url.length > 2048) {
            return NextResponse.json({ error: 'URL is too long (max 2048 characters)' }, { status: 400 });
        }

        // 3. Security Check (Safe Browsing)
        const isUnsafe = await checkUrlWithSafeBrowsing(url);
        if (isUnsafe) {
            return NextResponse.json({ error: 'This URL has been flagged as unsafe.' }, { status: 403 });
        }

        // 4. Logic & Persistence
        const expiresAtDate = calculateExpiration(expiresIn, expiresAt);
        const newUrl = await createShortUrlRecord(url, expiresAtDate);

        if (!newUrl) {
            return NextResponse.json({ error: 'Failed to generate unique short code. Please try again.' }, { status: 500 });
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
