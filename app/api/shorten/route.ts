import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { sql } from '@/lib/db';

// Use Edge runtime for faster response
export const runtime = 'edge';

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

        // Generate unique short code
        const shortCode = nanoid(7); // e.g., "xK92z7a"

        // Insert into database
        const [newUrl] = await sql`
      INSERT INTO urls (short_code, original_url, expires_at)
      VALUES (${shortCode}, ${url}, ${expiresAtDate ? expiresAtDate.toISOString() : null})
      RETURNING id, short_code, original_url, created_at, expires_at
    `;

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

        // Check for unique constraint violation
        if (error instanceof Error && error.message.includes('unique')) {
            // Retry with a new short code (rare collision case)
            return NextResponse.json(
                { error: 'Failed to generate unique short code. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
