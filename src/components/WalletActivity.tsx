'use client';

import { WalletActivity as WalletActivityType } from '@/lib/polymarket';
import { formatCurrency, formatRelativeTime } from '@/lib/polymarket';

interface WalletActivityProps {
    activity: WalletActivityType[];
    loading?: boolean;
}

export function WalletActivity({ activity, loading }: WalletActivityProps) {
    if (loading) {
        return (
            <div className="glass-card p-4">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="skeleton h-6 w-12 rounded"></div>
                                <div>
                                    <div className="skeleton h-4 w-32 mb-1"></div>
                                    <div className="skeleton h-3 w-20"></div>
                                </div>
                            </div>
                            <div className="skeleton h-4 w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activity.length === 0) {
        return (
            <div className="glass-card p-8 text-center text-muted-foreground">
                <p className="text-2xl mb-2">📜</p>
                <p>No recent activity</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Activity</h3>
                <span className="text-xs text-muted-foreground">Last {activity.length} trades</span>
            </div>

            <div className="divide-y divide-border">
                {activity.map((trade) => (
                    <div
                        key={trade.id}
                        className="flex items-center justify-between py-3"
                    >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Type badge */}
                            <span
                                className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${trade.type === 'BUY'
                                        ? 'bg-growth/20 text-growth'
                                        : 'bg-caution/20 text-caution'
                                    }`}
                            >
                                {trade.type}
                            </span>

                            {/* Trade details */}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm truncate">{trade.market}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={trade.outcome.toLowerCase() === 'yes' ? 'text-growth' : 'text-caution'}>
                                        {trade.outcome}
                                    </span>
                                    <span>·</span>
                                    <span>{trade.shares.toFixed(2)} @ {(trade.price * 100).toFixed(0)}¢</span>
                                </div>
                            </div>
                        </div>

                        {/* Amount & time */}
                        <div className="text-right flex-shrink-0 ml-2">
                            <p className={`font-medium text-sm ${trade.type === 'BUY' ? '' : 'text-growth'
                                }`}>
                                {trade.type === 'SELL' ? '+' : '-'}{formatCurrency(trade.total)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(trade.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
