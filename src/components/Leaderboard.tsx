'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LeaderboardSkeleton } from './Skeleton';
import { formatCurrency } from '@/lib/polymarket';

interface LeaderboardEntry {
    rank: number;
    username: string;
    address: string;
    fullAddress?: string;
    rewards: number;
    percentile: string;
    volume?: number;
    pnl?: number;
    profileImage?: string;
}

interface LeaderboardResponse {
    success: boolean;
    data: LeaderboardEntry[];
    total: number;
}

// Order by options
const orderOptions = [
    { value: 'VOL', label: '📊 Volume' },
    { value: 'PNL', label: '💰 Profit' },
];

const timePeriods = [
    { value: 'DAY', label: 'Today' },
    { value: 'WEEK', label: 'This Week' },
    { value: 'MONTH', label: 'This Month' },
    { value: 'ALL', label: 'All Time' },
];

function getRankIcon(rank: number) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function Leaderboard() {
    const [timePeriod, setTimePeriod] = useState('ALL');
    const [orderBy, setOrderBy] = useState('VOL');
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const limit = 25;

    // Debounce search for server-side query (500ms delay)
    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString(),
                timePeriod,
                orderBy,
            });

            // Server-side search
            if (debouncedSearch.trim()) {
                if (debouncedSearch.startsWith('0x')) {
                    params.set('user', debouncedSearch);
                } else {
                    params.set('userName', debouncedSearch);
                }
            }

            const response = await fetch(`/api/leaderboard?${params}`);
            const result: LeaderboardResponse = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError('Failed to load leaderboard');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [page, timePeriod, orderBy, debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const copyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters row */}
            <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Time period */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {timePeriods.map((tp) => (
                        <button
                            key={tp.value}
                            onClick={() => { setTimePeriod(tp.value); setPage(0); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${timePeriod === tp.value
                                ? 'bg-foreground text-background shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tp.label}
                        </button>
                    ))}
                </div>

                {/* Order by */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {orderOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setOrderBy(opt.value); setPage(0); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${orderBy === opt.value
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{data.length}</span> traders
                    {orderBy === 'VOL' ? ' by volume' : ' by profit'}
                    {debouncedSearch && <span className="text-primary"> · &quot;{debouncedSearch}&quot;</span>}
                </p>
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search username or 0x..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                        className="pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-56"
                    />
                    {loading && searchQuery && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">...</span>
                    )}
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="glass-card p-4 text-center text-caution">
                    {error}
                    <button onClick={fetchData} className="ml-2 underline cursor-pointer">
                        Retry
                    </button>
                </div>
            )}

            {/* Loading state */}
            {loading && <LeaderboardSkeleton />}

            {/* Empty state */}
            {!loading && !error && data.length === 0 && (
                <div className="glass-card p-8 text-center text-muted-foreground">
                    No traders found{searchQuery && ` for "${searchQuery}"`}. Try a different search.
                </div>
            )}

            {/* Leaderboard list */}
            {!loading && !error && data.length > 0 && (
                <div className="space-y-2">
                    {data.map((entry, index) => (
                        <div
                            key={`${entry.rank}-${entry.fullAddress || entry.address}`}
                            className="glass-card px-4 py-3 flex items-center gap-3"
                            style={{
                                animationDelay: `${index * 30}ms`,
                            }}
                        >
                            {(() => {
                                const fullAddress = entry.fullAddress && /^0x[a-fA-F0-9]{40}$/.test(entry.fullAddress)
                                    ? entry.fullAddress
                                    : null;

                                return (
                                    <>
                            {/* Rank */}
                            <div className="w-12 text-center flex-shrink-0">
                                {getRankIcon(entry.rank) ? (
                                    <span className="text-lg">{getRankIcon(entry.rank)}</span>
                                ) : (
                                    <span className="text-sm font-semibold text-muted-foreground">
                                        #{entry.rank}
                                    </span>
                                )}
                            </div>

                            {/* User info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{entry.username}</p>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {entry.address}
                                    </span>
                                    <button
                                        className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                                        onClick={() => fullAddress && copyAddress(fullAddress)}
                                        title="Copy address"
                                        disabled={!fullAddress}
                                    >
                                        {copiedAddress === fullAddress ? '✓' : '⧉'}
                                    </button>
                                </div>
                            </div>

                            {/* Volume */}
                            <div className="text-right w-20 flex-shrink-0 hidden sm:block">
                                <p className="text-xs text-muted-foreground">Vol</p>
                                <p className="font-medium text-sm">
                                    {formatCurrency(entry.volume || entry.rewards)}
                                </p>
                            </div>

                            {/* PnL */}
                            <div className="text-right w-24 flex-shrink-0">
                                <p className="text-xs text-muted-foreground">PnL</p>
                                <p className={`font-semibold text-sm ${(entry.pnl || 0) >= 0 ? 'text-growth' : 'text-caution'}`}>
                                    {(entry.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(entry.pnl || 0)}
                                </p>
                            </div>

                            {/* Action links - ALWAYS VISIBLE */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {/* Dashboard link */}
                                {fullAddress ? (
                                    <Link
                                        href={`/wallet/${fullAddress}`}
                                        className="w-8 h-8 rounded-lg bg-muted hover:bg-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                        title="View on PolyRadar"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <span className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground/50" title="Address unavailable">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </span>
                                )}
                                {/* Polymarket link */}
                                {fullAddress ? (
                                    <a
                                        href={`https://polymarket.com/profile/${fullAddress}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-lg bg-muted hover:bg-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                        title="View on Polymarket"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ) : (
                                    <span className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground/50" title="Address unavailable">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                                    </>
                                );
                            })()}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && data.length > 0 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:bg-border transition-colors cursor-pointer disabled:opacity-50"
                    >
                        ← Prev
                    </button>
                    <span className="px-3 py-1 text-sm text-muted-foreground">
                        Page {page + 1}
                    </span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={data.length < limit}
                        className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:bg-border transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
