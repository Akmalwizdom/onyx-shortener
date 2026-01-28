import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    try {
        const result = await sql`
            SELECT id, short_code, title, access_policy, created_at
            FROM urls
            WHERE short_code = ${slug}
            LIMIT 1
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const link = result[0];

        // Return PUBLIC info only. Do NOT return original_url.
        return NextResponse.json({
            success: true,
            data: {
                shortCode: link.short_code,
                title: link.title,
                accessPolicy: link.access_policy,
                createdAt: link.created_at
            }
        });

    } catch (error) {
        console.error('Error fetching link details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
