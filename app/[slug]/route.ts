import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { waitUntil } from '@vercel/functions';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch URL from database
        const result = await sql`
            SELECT id, original_url, expires_at, is_active
            FROM urls
            WHERE short_code = ${slug}
            LIMIT 1
        `;

        if (result.length === 0) {
            // Not found
            return NextResponse.redirect(new URL('/?error=not_found', request.url));
        }

        const url = result[0];

        // Check expiration
        if (url.expires_at && new Date(url.expires_at) < new Date()) {
            return NextResponse.redirect(new URL('/expired', request.url));
        }

        // Check if active
        // Note: is_active might be a utility column, respecting it.
        if (url.is_active === false) {
            return NextResponse.redirect(new URL('/expired?reason=inactive', request.url));
        }

        // Increment click count (Fire and forget for speed using waitUntil)
        const referrer = request.headers.get('referer') || 'direct';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Update stats asynchronously (non-blocking)
        waitUntil(
            Promise.allSettled([
                sql`UPDATE urls SET click_count = click_count + 1 WHERE id = ${url.id}`,
                sql`INSERT INTO clicks (url_id, referrer, user_agent) VALUES (${url.id}, ${referrer}, ${userAgent})`
            ])
        );

        return NextResponse.redirect(new URL(url.original_url));

    } catch (error) {
        console.error('Error in redirection:', error);
        return NextResponse.redirect(new URL('/?error=server_error', request.url));
    }
}
