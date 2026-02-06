// Polymarket API types and utilities

export interface LeaderboardEntry {
    rank: string;
    proxyWallet: string;
    userName: string;
    xUsername: string;
    verifiedBadge: boolean;
    vol: number;
    pnl: number;
    profileImage: string;
}

export interface LeaderboardResponse {
    data: LeaderboardEntry[];
    count: number;
}

export interface LPRewardEntry {
    rank: number;
    username: string;
    address: string;
    rewards: number;
    percentile: string;
    volume?: number;
    pnl?: number;
    profileImage?: string;
}

// Data API base URL
const DATA_API_BASE = 'https://data-api.polymarket.com';
const UPSTREAM_TIMEOUT_MS = 8000;

async function fetchJsonArray<T>(
    url: string,
    options: {
        revalidate: number;
        errorContext: string;
    }
): Promise<T[]> {
    const response = await fetch(url, {
        next: { revalidate: options.revalidate },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(`${options.errorContext}: ${response.status}`);
    }

    const json = await response.json();
    return Array.isArray(json) ? (json as T[]) : [];
}

function toFiniteNumber(value: string | number | undefined, fallback = 0): number {
    const numeric = typeof value === 'number' ? value : Number.parseFloat(value || '');
    return Number.isFinite(numeric) ? numeric : fallback;
}

export type TimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'ALL';
export type OrderBy = 'PNL' | 'VOL';
export type Category = 'OVERALL' | 'POLITICS' | 'SPORTS' | 'CRYPTO' | 'CULTURE';

export interface LeaderboardParams {
    limit?: number;
    offset?: number;
    timePeriod?: TimePeriod;
    orderBy?: OrderBy;
    category?: Category;
    userName?: string; // Search by username
    user?: string;     // Search by wallet address
}

/**
 * Fetch trader leaderboard from Polymarket Data API
 */
export async function fetchLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardResponse> {
    const {
        limit = 25,
        offset = 0,
        timePeriod = 'ALL',
        orderBy = 'VOL',
        category = 'OVERALL',
        userName,
        user,
    } = params;

    const url = new URL(`${DATA_API_BASE}/v1/leaderboard`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('timePeriod', timePeriod);
    url.searchParams.set('orderBy', orderBy);
    url.searchParams.set('category', category);

    // Server-side search
    if (userName) {
        url.searchParams.set('userName', userName);
    }
    if (user) {
        url.searchParams.set('user', user);
    }

    const rawData = await fetchJsonArray<LeaderboardEntry>(url.toString(), {
        revalidate: 60,
        errorContext: 'Leaderboard API error',
    });

    // Polymarket returns raw array, wrap it for our interface
    return {
        data: rawData,
        count: rawData.length,
    };
}

/**
 * Transform API response to our LPRewardEntry format
 */
export function transformLeaderboardData(data: LeaderboardResponse): LPRewardEntry[] {
    return data.data.map((entry: LeaderboardEntry) => ({
        rank: Number.parseInt(entry.rank, 10) || 0,
        username: entry.userName || `User ${entry.proxyWallet?.slice(0, 6) || 'Unknown'}`,
        address: entry.proxyWallet ? `${entry.proxyWallet.slice(0, 6)}...${entry.proxyWallet.slice(-4)}` : 'Unknown',
        fullAddress: entry.proxyWallet || '',
        rewards: toFiniteNumber(entry.vol), // Using volume as proxy for now
        percentile: getPercentile(Number.parseInt(entry.rank, 10) || 0),
        volume: toFiniteNumber(entry.vol),
        pnl: toFiniteNumber(entry.pnl),
        profileImage: entry.profileImage || undefined,
    }));
}

/**
 * Calculate percentile based on rank
 */
function getPercentile(rank: number): string {
    if (rank <= 646) return 'TOP 1%';
    if (rank <= 1000) return 'TOP 1000';
    if (rank <= 6457) return 'TOP 10%';
    return 'ALL';
}

/**
 * Format large numbers for display
 */
export function formatCurrency(value: number): string {
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
}

/**
 * Format wallet address for display
 */
export function truncateAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================================================
// Wallet Analytics Types & Functions
// ============================================================================

export interface WalletPosition {
    asset: string;
    conditionId: string;
    market: string;
    marketSlug: string;
    outcome: string;
    outcomeIndex: number;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    pnl: number;
    pnlPercent: number;
}

export interface WalletActivity {
    id: string;
    type: 'BUY' | 'SELL';
    market: string;
    marketSlug: string;
    outcome: string;
    shares: number;
    price: number;
    total: number;
    timestamp: string;
}

export interface WalletStats {
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    positionsCount: number;
    winRate: number;
    tradesCount: number;
}

export interface WalletData {
    address: string;
    stats: WalletStats;
    positions: WalletPosition[];
    activity: WalletActivity[];
    warnings?: string[];
}

interface PolymarketPosition {
    proxyWallet?: string;
    asset?: string;
    conditionId?: string;
    size?: string;
    avgPrice?: string;
    market?: string;
    outcome?: string;
    outcomeIndex?: number;
    curPrice?: string;
    cashBalance?: string;
    title?: string;
    slug?: string;
}

interface PolymarketActivity {
    id?: string;
    proxyWallet?: string;
    type?: string;
    conditionId?: string;
    asset?: string;
    size?: string;
    price?: string;
    timestamp?: string;
    market?: string;
    outcome?: string;
    title?: string;
    slug?: string;
    transactionHash?: string;
}

/**
 * Fetch wallet positions from Polymarket Data API
 */
export async function fetchWalletPositions(address: string): Promise<WalletPosition[]> {
    const url = `${DATA_API_BASE}/positions?user=${address}`;

    const rawData = await fetchJsonArray<PolymarketPosition>(url, {
        revalidate: 30,
        errorContext: 'Positions API error',
    });

    return rawData
        .filter((p) => toFiniteNumber(p.size) > 0)
        .map((p): WalletPosition => {
            const shares = toFiniteNumber(p.size);
            const avgPrice = toFiniteNumber(p.avgPrice);
            const currentPrice = toFiniteNumber(p.curPrice);
            const value = shares * currentPrice;
            const cost = shares * avgPrice;
            const pnl = value - cost;
            const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

            return {
                asset: p.asset || '',
                conditionId: p.conditionId || '',
                market: p.title || p.market || 'Unknown Market',
                marketSlug: p.slug || '',
                outcome: p.outcome || (p.outcomeIndex === 0 ? 'Yes' : 'No'),
                outcomeIndex: p.outcomeIndex ?? 0,
                shares,
                avgPrice,
                currentPrice,
                value,
                pnl,
                pnlPercent,
            };
        });
}

/**
 * Fetch wallet activity/trades from Polymarket Data API
 */
export async function fetchWalletActivity(address: string, limit = 20): Promise<WalletActivity[]> {
    const url = `${DATA_API_BASE}/activity?user=${address}&limit=${limit}`;

    const rawData = await fetchJsonArray<PolymarketActivity>(url, {
        revalidate: 30,
        errorContext: 'Activity API error',
    });

    return rawData.map((a): WalletActivity => ({
        id: a.id || a.transactionHash || Math.random().toString(),
        type: (a.type?.toUpperCase() === 'SELL' ? 'SELL' : 'BUY') as 'BUY' | 'SELL',
        market: a.title || a.market || 'Unknown Market',
        marketSlug: a.slug || '',
        outcome: a.outcome || 'Yes',
        shares: toFiniteNumber(a.size),
        price: toFiniteNumber(a.price),
        total: toFiniteNumber(a.size) * toFiniteNumber(a.price),
        timestamp: a.timestamp || new Date().toISOString(),
    }));
}

/**
 * Calculate wallet stats from positions and activity
 */
export function calculateWalletStats(
    positions: WalletPosition[],
    activity: WalletActivity[]
): WalletStats {
    const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
    const totalCost = positions.reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
    const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    // Simple win rate: positions with positive PnL
    const winningPositions = positions.filter((p) => p.pnl > 0).length;
    const winRate = positions.length > 0 ? (winningPositions / positions.length) * 100 : 0;

    return {
        totalValue,
        totalPnl,
        totalPnlPercent,
        positionsCount: positions.length,
        winRate,
        tradesCount: activity.length,
    };
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return 'Unknown time';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) {
        return 'Just now';
    }

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
}
