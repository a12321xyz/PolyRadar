'use client';

import { WalletPosition } from '@/lib/polymarket';
import { formatCurrency } from '@/lib/polymarket';

interface WalletPositionsProps {
    positions: WalletPosition[];
    loading?: boolean;
}

export function WalletPositions({ positions, loading }: WalletPositionsProps) {
    if (loading) {
        return (
            <div className="glass-card p-4">
                <h3 className="font-semibold mb-4">Active Positions</h3>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div className="flex-1">
                                <div className="skeleton h-4 w-48 mb-2"></div>
                                <div className="skeleton h-3 w-24"></div>
                            </div>
                            <div className="skeleton h-5 w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="glass-card p-8 text-center text-muted-foreground">
                <p className="text-2xl mb-2">📭</p>
                <p>No active positions</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Active Positions</h3>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                    {positions.length} market{positions.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-2">
                {positions.map((position) => (
                    <div
                        key={`${position.conditionId}-${position.outcomeIndex}`}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                        {/* Outcome badge */}
                        <span
                            className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${position.outcome.toLowerCase() === 'yes'
                                    ? 'bg-growth/20 text-growth'
                                    : 'bg-caution/20 text-caution'
                                }`}
                        >
                            {position.outcome}
                        </span>

                        {/* Market info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{position.market}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                <span>{position.shares.toFixed(2)} shares</span>
                                <span>@ {(position.avgPrice * 100).toFixed(0)}¢</span>
                                <span>→ {(position.currentPrice * 100).toFixed(0)}¢</span>
                            </div>
                        </div>

                        {/* Value & PnL */}
                        <div className="text-right flex-shrink-0">
                            <p className="font-medium text-sm">{formatCurrency(position.value)}</p>
                            <p
                                className={`text-xs ${position.pnl >= 0 ? 'text-growth' : 'text-caution'
                                    }`}
                            >
                                {position.pnl >= 0 ? '+' : ''}
                                {formatCurrency(position.pnl)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
