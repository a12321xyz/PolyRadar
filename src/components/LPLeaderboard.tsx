'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LeaderboardSkeleton } from './Skeleton';
import { formatCurrency } from '@/lib/polymarket';

interface LPEntry {
    rank: number;
    username: string;
    address: string;
    fullAddress: string;
    rewards: number;
    volume?: number;
}

// Note: LP rewards data would come from a different API endpoint
// For now, using the same trader API but will be updated when LP-specific API is found

export function LPLeaderboard() {
    const [data, setData] = useState<LPEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const limit = 25;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Replace with actual LP rewards API when found
            // Current: Using trader leaderboard as placeholder
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString(),
                timePeriod: 'ALL',
                orderBy: 'VOL',
            });

            const response = await fetch(`/api/leaderboard?${params}`);
            const result = await response.json();

            if (result.success) {
                // Transform to LP format (placeholder)
                const lpData: LPEntry[] = result.data.map((entry: LPEntry) => ({
                    ...entry,
                    rewards: entry.volume ? entry.volume * 0.001 : 0, // Placeholder calc
                }));
                setData(lpData);
            } else {
                setError('Failed to load LP rewards');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [page]);

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
            {/* Info banner */}
            <div className="glass-card p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-center">
                    <span className="font-medium">💧 LP Rewards</span> — Rewards earned by providing liquidity to Polymarket markets
                </p>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Top liquidity providers
                </p>
                <button
                    onClick={fetchData}
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    disabled={loading}
                >
                    ↻ Refresh
                </button>
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

            {/* LP List */}
            {!loading && !error && data.length > 0 && (
                <div className="space-y-2">
                    {data.map((entry, index) => {
                        const fullAddress = /^0x[a-fA-F0-9]{40}$/.test(entry.fullAddress)
                            ? entry.fullAddress
                            : null;

                        return (
                        <div
                            key={`${entry.rank}-${entry.fullAddress}`}
                            className="glass-card px-4 py-3 flex items-center gap-3"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            {/* Rank */}
                            <div className="w-12 text-center flex-shrink-0">
                                <span className="text-sm font-semibold text-muted-foreground">
                                    #{entry.rank}
                                </span>
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
                                <p className="text-xs text-muted-foreground">Volume</p>
                                <p className="font-medium text-sm">
                                    {formatCurrency(entry.volume || 0)}
                                </p>
                            </div>

                            {/* Rewards (estimated) */}
                            <div className="text-right w-24 flex-shrink-0">
                                <p className="text-xs text-muted-foreground">Est. Rewards</p>
                                <p className="font-semibold text-sm text-growth">
                                    {formatCurrency(entry.rewards)}
                                </p>
                            </div>

                            {/* Action links */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {fullAddress ? (
                                    <>
                                        <Link
                                            href={`/wallet/${fullAddress}`}
                                            className="w-8 h-8 rounded-lg bg-muted hover:bg-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                            title="View on PolyRadar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </Link>
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
                                    </>
                                ) : (
                                    <>
                                        <span className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground/50" title="Address unavailable">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </span>
                                        <span className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground/50" title="Address unavailable">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        );
                    })}
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

            {/* Note about data */}
            <p className="text-xs text-center text-muted-foreground pt-4">
                Note: LP rewards estimates based on volume. Actual rewards may vary per epoch.
            </p>
        </div>
    );
}
