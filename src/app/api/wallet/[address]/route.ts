import { NextRequest, NextResponse } from 'next/server';
import {
    fetchWalletPositions,
    fetchWalletActivity,
    calculateWalletStats,
    WalletData,
} from '@/lib/polymarket';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json(
                { success: false, error: 'Invalid wallet address' },
                { status: 400 }
            );
        }

        // Fetch positions and activity in parallel, allowing partial results.
        const [positionsResult, activityResult] = await Promise.allSettled([
            fetchWalletPositions(address),
            fetchWalletActivity(address, 20),
        ]);

        const warnings: string[] = [];

        const positions = positionsResult.status === 'fulfilled' ? positionsResult.value : [];
        if (positionsResult.status === 'rejected') {
            console.error('Wallet positions fetch error:', positionsResult.reason);
            warnings.push('Positions are temporarily unavailable due to upstream API issues.');
        }

        const activity = activityResult.status === 'fulfilled' ? activityResult.value : [];
        if (activityResult.status === 'rejected') {
            console.error('Wallet activity fetch error:', activityResult.reason);
            warnings.push('Recent activity is temporarily unavailable due to upstream API issues.');
        }

        if (warnings.length === 2) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Polymarket data is temporarily unavailable. Please try again shortly.',
                },
                { status: 502 }
            );
        }

        // Calculate stats
        const stats = calculateWalletStats(positions, activity);

        const walletData: WalletData = {
            address,
            stats,
            positions,
            activity,
            warnings: warnings.length > 0 ? warnings : undefined,
        };

        return NextResponse.json({
            success: true,
            data: walletData,
        });
    } catch (error) {
        console.error('Wallet API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch wallet data' },
            { status: 500 }
        );
    }
}
