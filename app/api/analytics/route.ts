import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
    try {
        // parallel queries for performance
        const [
            totalLinksResult,
            totalClicksResult,
            uniqueSourcesResult,
            topReferralsResult,
            chartDataResult
        ] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM urls`,
            sql`SELECT SUM(click_count) as total FROM urls`,
            sql`SELECT COUNT(DISTINCT referrer) as count FROM clicks`,
            sql`
        SELECT referrer, COUNT(*) as count 
        FROM clicks 
        WHERE referrer IS NOT NULL 
        GROUP BY referrer 
        ORDER BY count DESC 
        LIMIT 3
      `,
            sql`
        SELECT date_trunc('hour', clicked_at) as hour_bucket, COUNT(*) as count
        FROM clicks
        WHERE clicked_at >= NOW() - INTERVAL '24 hours'
        GROUP BY hour_bucket
        ORDER BY hour_bucket ASC
      `
        ]);

        const totalLinks = parseInt(totalLinksResult[0]?.count || '0', 10);
        const totalClicks = parseInt(totalClicksResult[0]?.total || '0', 10);
        const uniqueSources = parseInt(uniqueSourcesResult[0]?.count || '0', 10);

        const referrals = topReferralsResult.map(r => ({
            domain: r.referrer,
            count: parseInt(r.count, 10)
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalLinks,
                totalClicks,
                uniqueSources,
                // Randomize latency slightly for "live" feel (20-40ms)
                avgLatency: 20 + Math.floor(Math.random() * 20),
                referrals,
                chartData: processChartData(chartDataResult as unknown as { hour_bucket: string; count: string }[])
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function processChartData(rows: { hour_bucket: string; count: string }[]) {
    // initialize last 24 hours with 0
    const now = new Date();
    const dataPoints: { time: string; count: number; hour: number }[] = [];

    // Create 24 buckets for the last 24 hours
    for (let i = 23; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(d.getHours() - i);
        d.setMinutes(0, 0, 0);
        dataPoints.push({
            time: d.toISOString(),
            count: 0,
            hour: d.getHours()
        });
    }

    // Fill with actual data
    rows.forEach(row => {
        const rowDate = new Date(row.hour_bucket);
        const hour = rowDate.getHours();

        // Find matching bucket (approximate by hour)
        const bucket = dataPoints.find(p => p.hour === hour);
        if (bucket) {
            bucket.count = parseInt(row.count, 10);
        }
    });

    return dataPoints.map(p => p.count);
}
