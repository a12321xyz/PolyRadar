'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/polymarket';

interface WalletData {
    rank: number;
    username: string;
    address: string;
    fullAddress?: string;
    volume: number;
    pnl: number;
}

export function AddressLookup() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WalletData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async () => {
        const query = address.trim();
        if (!query) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Search for the wallet in the leaderboard
            const response = await fetch(`/api/leaderboard?limit=50&timePeriod=ALL&orderBy=VOL`);
            const data = await response.json();

            if (data.success) {
                const normalizedQuery = query.toLowerCase();
                const isAddressQuery = normalizedQuery.startsWith('0x');

                // Prefer exact full-address matching when user enters a wallet address.
                const found = data.data.find((entry: WalletData) => {
                    const fullAddress = entry.fullAddress?.toLowerCase();

                    if (isAddressQuery && fullAddress) {
                        return fullAddress === normalizedQuery;
                    }

                    return entry.username.toLowerCase().includes(normalizedQuery);
                });

                if (found) {
                    setResult(found);
                } else {
                    setError('Wallet not found in top traders. Try a different address or check the leaderboard.');
                }
            } else {
                setError(data.error || 'Failed to lookup wallet. Please try again.');
            }
        } catch (err) {
            setError('Failed to lookup wallet. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 max-w-lg mx-auto">
            <h3 className="font-semibold text-lg mb-4 text-center">
                🔍 Lookup Any Wallet
            </h3>

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Enter wallet address or username..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    onClick={handleLookup}
                    disabled={loading || !address.trim()}
                    className="btn btn-primary px-6 disabled:opacity-50"
                >
                    {loading ? '...' : 'Search'}
                </button>
            </div>

            {error && (
                <p className="text-sm text-caution mt-3 text-center">{error}</p>
            )}

            {result && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Username</span>
                        <span className="font-medium">{result.username}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rank</span>
                        <span className="font-medium">#{result.rank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Volume</span>
                        <span className="font-medium">{formatCurrency(result.volume)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">PnL</span>
                        <span className={`font-semibold ${result.pnl >= 0 ? 'text-growth' : 'text-caution'}`}>
                            {result.pnl >= 0 ? '+' : ''}{formatCurrency(result.pnl)}
                        </span>
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground mt-4 text-center">
                All data is public. No wallet connection needed.
            </p>
        </div>
    );
}
