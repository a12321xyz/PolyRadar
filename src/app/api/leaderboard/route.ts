import { NextRequest, NextResponse } from 'next/server';
import { fetchLeaderboard, transformLeaderboardData } from '@/lib/polymarket';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const parsedLimit = Number.parseInt(searchParams.get('limit') || '25', 10);
        const parsedOffset = Number.parseInt(searchParams.get('offset') || '0', 10);

        const limit = Number.isNaN(parsedLimit) ? 25 : Math.min(Math.max(parsedLimit, 1), 100);
        const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0);

        const rawTimePeriod = searchParams.get('timePeriod') || 'ALL';
        const rawOrderBy = searchParams.get('orderBy') || 'VOL';

        const timePeriod = ['DAY', 'WEEK', 'MONTH', 'ALL'].includes(rawTimePeriod)
            ? (rawTimePeriod as 'DAY' | 'WEEK' | 'MONTH' | 'ALL')
            : 'ALL';
        const orderBy = ['PNL', 'VOL'].includes(rawOrderBy)
            ? (rawOrderBy as 'PNL' | 'VOL')
            : 'VOL';

        // Server-side search params
        const userName = searchParams.get('userName') || undefined;
        const user = searchParams.get('user') || undefined;

        const data = await fetchLeaderboard({
            limit,
            offset,
            timePeriod,
            orderBy,
            userName,
            user,
        });

        const transformed = transformLeaderboardData(data);

        return NextResponse.json({
            success: true,
            data: transformed,
            total: data.count,
            meta: {
                limit,
                offset,
                timePeriod,
                orderBy,
                userName,
                user,
            },
        });
    } catch (error) {
        console.error('Leaderboard API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch leaderboard data' },
            { status: 500 }
        );
    }
}
