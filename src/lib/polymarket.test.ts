import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    fetchWalletActivity,
    fetchWalletPositions,
    formatRelativeTime,
    LeaderboardResponse,
    transformLeaderboardData,
} from './polymarket';

describe('polymarket data parsing', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('guards malformed leaderboard payload fields', () => {
        const input: LeaderboardResponse = {
            data: [
                {
                    rank: 'not-a-number',
                    proxyWallet: '',
                    userName: '',
                    xUsername: '',
                    verifiedBadge: false,
                    vol: Number.NaN,
                    pnl: Number.NaN,
                    profileImage: '',
                },
            ],
            count: 1,
        };

        const transformed = transformLeaderboardData(input);

        expect(transformed).toHaveLength(1);
        expect(transformed[0].rank).toBe(0);
        expect(transformed[0].address).toBe('Unknown');
        expect(transformed[0].rewards).toBe(0);
        expect(transformed[0].pnl).toBe(0);
    });

    it('returns empty positions on non-array payload', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ invalid: true }),
            })
        );

        const positions = await fetchWalletPositions('0x0000000000000000000000000000000000000000');
        expect(positions).toEqual([]);
    });

    it('throws on upstream wallet activity failure', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 503,
            })
        );

        await expect(
            fetchWalletActivity('0x0000000000000000000000000000000000000000')
        ).rejects.toThrow('Activity API error: 503');
    });
});

describe('formatRelativeTime', () => {
    it('handles invalid timestamps', () => {
        expect(formatRelativeTime('not-a-timestamp')).toBe('Unknown time');
    });
});
