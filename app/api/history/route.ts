import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    try {
        const result = await sql`
            SELECT id, short_code, original_url, created_at, click_count, access_policy
            FROM urls
            WHERE creator_wallet = ${wallet}
            ORDER BY created_at DESC
            LIMIT 50
        `;

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
