'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletStats } from '@/components/WalletStats';
import { formatCurrency } from '@/lib/polymarket';
import type { WalletData } from '@/lib/polymarket';

export default function ComparePage() {
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [wallet1, setWallet1] = useState<WalletData | null>(null);
    const [wallet2, setWallet2] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

    const handleCompare = async () => {
        const addr1 = address1.trim();
        const addr2 = address2.trim();

        if (!isValidAddress(addr1) || !isValidAddress(addr2)) {
            setError('Please enter two valid wallet addresses');
            return;
        }

        if (addr1.toLowerCase() === addr2.toLowerCase()) {
            setError('Please enter two different addresses');
            return;
        }

        setError('');
        setLoading(true);
        setWallet1(null);
        setWallet2(null);

        try {
            const [res1, res2] = await Promise.all([
                fetch(`/api/wallet/${addr1}`),
                fetch(`/api/wallet/${addr2}`),
            ]);

            const [data1, data2] = await Promise.all([
                res1.json(),
                res2.json(),
            ]);

            if (data1.success) setWallet1(data1.data);
            if (data2.success) setWallet2(data2.data);

            if (!data1.success && !data2.success) {
                setError('Failed to fetch wallet data');
            }
        } catch (err) {
            console.error('Compare error:', err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    ← Back
                </Link>
                <h1 className="text-xl font-bold">Compare Wallets</h1>
            </div>

            {/* Input section */}
            <div className="glass-card p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Wallet 1</label>
                        <input
                            type="text"
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm font-mono placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Wallet 2</label>
                        <input
                            type="text"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm font-mono placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-caution text-sm mb-4">{error}</p>
                )}

                <button
                    onClick={handleCompare}
                    disabled={loading}
                    className="btn btn-primary w-full md:w-auto"
                >
                    {loading ? 'Loading...' : '⚖️ Compare'}
                </button>
            </div>

            {/* Results */}
            {(wallet1 || wallet2 || loading) && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Wallet 1 */}
                    <div>
                        {wallet1 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">
                                        {truncate(wallet1.address)}
                                    </h3>
                                    <Link
                                        href={`/wallet/${wallet1.address}`}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        View full →
                                    </Link>
                                </div>
                                {wallet1.warnings && wallet1.warnings.length > 0 && (
                                    <p className="text-xs text-caution bg-caution/10 border border-caution/20 rounded-md px-2 py-1">
                                        {wallet1.warnings.join(' ')}
                                    </p>
                                )}
                                <WalletStats stats={wallet1.stats} />
                                <CompareMetrics data={wallet1} />
                            </div>
                        ) : loading ? (
                            <WalletStats stats={{ totalValue: 0, totalPnl: 0, totalPnlPercent: 0, positionsCount: 0, winRate: 0, tradesCount: 0 }} loading />
                        ) : null}
                    </div>

                    {/* Wallet 2 */}
                    <div>
                        {wallet2 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">
                                        {truncate(wallet2.address)}
                                    </h3>
                                    <Link
                                        href={`/wallet/${wallet2.address}`}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        View full →
                                    </Link>
                                </div>
                                {wallet2.warnings && wallet2.warnings.length > 0 && (
                                    <p className="text-xs text-caution bg-caution/10 border border-caution/20 rounded-md px-2 py-1">
                                        {wallet2.warnings.join(' ')}
                                    </p>
                                )}
                                <WalletStats stats={wallet2.stats} />
                                <CompareMetrics data={wallet2} />
                            </div>
                        ) : loading ? (
                            <WalletStats stats={{ totalValue: 0, totalPnl: 0, totalPnlPercent: 0, positionsCount: 0, winRate: 0, tradesCount: 0 }} loading />
                        ) : null}
                    </div>
                </div>
            )}

            {/* Comparison summary */}
            {wallet1 && wallet2 && (
                <div className="glass-card p-4 mt-6">
                    <h3 className="font-semibold mb-3">Quick Comparison</h3>
                    <div className="space-y-2 text-sm">
                        <CompareRow
                            label="Portfolio Value"
                            val1={wallet1.stats.totalValue}
                            val2={wallet2.stats.totalValue}
                            format={formatCurrency}
                        />
                        <CompareRow
                            label="Total PnL"
                            val1={wallet1.stats.totalPnl}
                            val2={wallet2.stats.totalPnl}
                            format={formatCurrency}
                        />
                        <CompareRow
                            label="Win Rate"
                            val1={wallet1.stats.winRate}
                            val2={wallet2.stats.winRate}
                            format={(v) => `${v.toFixed(0)}%`}
                        />
                        <CompareRow
                            label="Active Positions"
                            val1={wallet1.stats.positionsCount}
                            val2={wallet2.stats.positionsCount}
                            format={(v) => v.toString()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function CompareMetrics({ data }: { data: WalletData }) {
    const topPosition = data.positions[0];

    return (
        <div className="glass-card p-3">
            <p className="text-xs text-muted-foreground mb-2">Top Position</p>
            {topPosition ? (
                <p className="text-sm line-clamp-2">{topPosition.market}</p>
            ) : (
                <p className="text-sm text-muted-foreground">No positions</p>
            )}
        </div>
    );
}

function CompareRow({
    label,
    val1,
    val2,
    format,
}: {
    label: string;
    val1: number;
    val2: number;
    format: (v: number) => string;
}) {
    const winner = val1 > val2 ? 1 : val2 > val1 ? 2 : 0;

    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-4">
                <span className={winner === 1 ? 'text-growth font-medium' : ''}>
                    {format(val1)}
                </span>
                <span className="text-muted-foreground">vs</span>
                <span className={winner === 2 ? 'text-growth font-medium' : ''}>
                    {format(val2)}
                </span>
            </div>
        </div>
    );
}
