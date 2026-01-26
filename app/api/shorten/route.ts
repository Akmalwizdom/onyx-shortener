import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { sql } from '@/lib/db';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Use Edge runtime for faster response
export const runtime = 'edge';

// Initialize Rate Limiter (only if env vars are present)
let ratelimit: Ratelimit | null = null;

// Support both standard Upstash env vars and Vercel KV env vars
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (redisUrl && redisToken) {
    ratelimit = new Ratelimit({
        redis: new Redis({
            url: redisUrl,
            token: redisToken,
        }),
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
        analytics: true,
        prefix: "onyx_shortener_ratelimit",
    });
}

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 */
function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * POST /api/shorten
 * Creates a short URL from the provided original URL
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limiting Check
        if (ratelimit) {
            const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
            const { success, limit, reset, remaining } = await ratelimit.limit(ip);

            if (!success) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    {
                        status: 429,
                        headers: {
                            'X-RateLimit-Limit': limit.toString(),
                            'X-RateLimit-Remaining': remaining.toString(),
                            'X-RateLimit-Reset': reset.toString(),
                        },
                    }
                );
            }
        }

        const body = await request.json();
        const { url, expiresIn, expiresAt } = body;

        // Validate input
        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required and must be a string' },
                { status: 400 }
            );
        }

        // Validate URL format
        if (!isValidUrl(url)) {
            return NextResponse.json(
                { error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL.' },
                { status: 400 }
            );
        }

        // Check URL length (prevent abuse)
        if (url.length > 2048) {
            return NextResponse.json(
                { error: 'URL is too long (max 2048 characters)' },
                { status: 400 }
            );
        }

        // Calculate expiration
        let expiresAtDate: Date | null = null;

        if (expiresIn && typeof expiresIn === 'number') {
            // Expires in X days
            expiresAtDate = new Date();
            expiresAtDate.setDate(expiresAtDate.getDate() + expiresIn);
        } else if (expiresAt && typeof expiresAt === 'string') {
            // Specific date provided
            expiresAtDate = new Date(expiresAt);
            if (isNaN(expiresAtDate.getTime())) {
                expiresAtDate = null;
            }
        } else {
            // Default Expiration: 30 Days (Industry Best Practice)
            expiresAtDate = new Date();
            expiresAtDate.setDate(expiresAtDate.getDate() + 30);
        }

        // Generate unique short code with Retry Logic
        let shortCode = '';
        let newUrl = null;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                shortCode = nanoid(7); // e.g., "xK92z7a"

                // Insert into database
                const result = await sql`
                    INSERT INTO urls (short_code, original_url, expires_at)
                    VALUES (${shortCode}, ${url}, ${expiresAtDate ? expiresAtDate.toISOString() : null})
                    RETURNING id, short_code, original_url, created_at, expires_at
                `;
                
                if (result && result.length > 0) {
                    newUrl = result[0];
                    break; // Success, exit loop
                }
            } catch (err: any) {
                // Check specifically for unique constraint violations
                if (err.message && err.message.includes('unique')) {
                    retries++;
                    console.warn(`Collision detected for code ${shortCode}. Retrying (${retries}/${maxRetries})...`);
                    continue;
                }
                throw err; // Re-throw other errors
            }
        }

        if (!newUrl) {
             return NextResponse.json(
                { error: 'Failed to generate unique short code after multiple attempts. Please try again.' },
                { status: 500 }
            );
        }

        // Get base URL from environment or request
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        // Return the shortened URL
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

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
