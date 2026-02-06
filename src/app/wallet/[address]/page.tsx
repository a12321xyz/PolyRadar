'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WalletStats } from '@/components/WalletStats';
import { WalletPositions } from '@/components/WalletPositions';
import { WalletActivity } from '@/components/WalletActivity';
import type { WalletData } from '@/lib/polymarket';

export default function WalletPage() {
    const params = useParams();
    const address = params.address as string;

    const [data, setData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Validate address format
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

    const fetchWalletData = useCallback(async () => {
        if (!isValidAddress) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/wallet/${address}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to load wallet data');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [address, isValidAddress]);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    if (!isValidAddress) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Invalid Wallet Address</h1>
                <p className="text-muted-foreground mb-6">
                    The address &quot;{address}&quot; doesn&apos;t look like a valid Ethereum address.
                </p>
                <Link href="/" className="btn btn-primary">
                    ← Back to Leaderboard
                </Link>
            </div>
        );
    }

    const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    ← Back
                </Link>
            </div>

            {/* Wallet info */}
            <div className="glass-card p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Wallet Analytics</h1>
                        <p className="text-muted-foreground font-mono text-sm mt-1">
                            {truncatedAddress}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-secondary text-sm"
                            onClick={copyAddress}
                        >
                            {copied ? '✓ Copied!' : 'Copy Address'}
                        </button>
                        <a
                            href={`https://polymarket.com/profile/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary text-sm"
                        >
                            View on Polymarket ↗
                        </a>
                    </div>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="glass-card p-6 mb-6 text-center">
                    <p className="text-caution mb-4">{error}</p>
                    <button onClick={fetchWalletData} className="btn btn-secondary">
                        Try Again
                    </button>
                </div>
            )}

            {/* Partial data warning */}
            {!error && data?.warnings && data.warnings.length > 0 && (
                <div className="glass-card p-4 mb-6 border border-yellow-500/30 bg-yellow-500/10">
                    <p className="text-sm font-medium mb-1">Some data could not be loaded</p>
                    <p className="text-sm text-muted-foreground">{data.warnings.join(' ')}</p>
                </div>
            )}

            {/* Stats */}
            <div className="mb-6">
                <WalletStats
                    stats={data?.stats || {
                        totalValue: 0,
                        totalPnl: 0,
                        totalPnlPercent: 0,
                        positionsCount: 0,
                        winRate: 0,
                        tradesCount: 0,
                    }}
                    loading={loading}
                />
            </div>

            {/* Two column layout for positions and activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Positions */}
                <div className="lg:col-span-2 xl:col-span-1">
                    <WalletPositions
                        positions={data?.positions || []}
                        loading={loading}
                    />
                </div>

                {/* Activity */}
                <div className="lg:col-span-2 xl:col-span-1">
                    <WalletActivity
                        activity={data?.activity || []}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
