import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch URL stats from database
        const result = await sql`
      SELECT 
        id,
        short_code,
        original_url,
        click_count,
        created_at,
        expires_at,
        is_active
      FROM urls
      WHERE short_code = ${slug}
      LIMIT 1
    `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Short URL not found' },
                { status: 404 }
            );
        }

        const urlData = result[0];

        return NextResponse.json({
            success: true,
            data: {
                shortCode: urlData.short_code,
                originalUrl: urlData.original_url,
                clickCount: urlData.click_count,
                createdAt: urlData.created_at,
                expiresAt: urlData.expires_at,
                isActive: urlData.is_active,
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
