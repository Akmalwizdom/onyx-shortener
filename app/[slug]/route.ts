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

        // Fetch URL data, including access_policy
        const result = await sql`
            SELECT id, original_url, expires_at, is_active, access_policy
            FROM urls
            WHERE short_code = ${slug}
            LIMIT 1
        `;

        if (result.length === 0) {
            // Not found
            return NextResponse.redirect(new URL('/?error=not_found', request.url));
        }

        const url = result[0];

        // 1. Check expiration
        if (url.expires_at && new Date(url.expires_at) < new Date()) {
            return NextResponse.redirect(new URL('/expired', request.url));
        }

        // 2. Check if active
        if (url.is_active === false) {
            return NextResponse.redirect(new URL('/expired?reason=inactive', request.url));
        }

        // 3. TRACKING (Always track the click attempt, even if gated)
        // Increment click count (Fire and forget for speed using waitUntil)
        const referrer = request.headers.get('referer') || null;
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const ip = request.headers.get("x-forwarded-for") || 'unknown';
        // Simple hash for privacy-preserving unique click tracking (optional improvement later)

        waitUntil(
            Promise.allSettled([
                sql`UPDATE urls SET click_count = click_count + 1 WHERE id = ${url.id}`,
                sql`INSERT INTO clicks (url_id, referrer, user_agent) VALUES (${url.id}, ${referrer}, ${userAgent})`
            ])
        );

        // 4. GATEKEEPER CHECK
        // If access_policy exists and is not empty object/null
        if (url.access_policy && Object.keys(url.access_policy).length > 0) {
            // Redirect to the Unlock Page instead of the destination
            // Pass the original URL slug so the Unlock Page knows what to fetch
            return NextResponse.redirect(new URL(`/unlock/${slug}`, request.url));
        }

        // 5. Direct Redirect (No Gate)
        return NextResponse.redirect(new URL(url.original_url));

    } catch (error) {
        console.error('Error in redirection:', error);
        return NextResponse.redirect(new URL('/?error=server_error', request.url));
    }
}

// DUMMY POST HANDLER
// Some 3rd party libraries or ad-blockers can cause accidental POST requests
// to dynamic slugs. Adding this prevents "405 Method Not Allowed" console noise.
export async function POST() {
    return new NextResponse(null, { status: 204 });
}