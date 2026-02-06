'use client';

import { WalletStats as WalletStatsType } from '@/lib/polymarket';
import { formatCurrency } from '@/lib/polymarket';

interface WalletStatsProps {
    stats: WalletStatsType;
    loading?: boolean;
}

function StatCard({
    icon,
    label,
    value,
    subValue,
    colorClass,
}: {
    icon: string;
    label: string;
    value: string;
    subValue?: string;
    colorClass?: string;
}) {
    return (
        <div className="glass-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>{icon}</span>
                <span>{label}</span>
            </div>
            <p className={`text-xl font-bold ${colorClass || ''}`}>{value}</p>
            {subValue && (
                <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
        </div>
    );
}

export function WalletStats({ stats, loading }: WalletStatsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-card p-4 h-24">
                        <div className="skeleton h-4 w-20 mb-2"></div>
                        <div className="skeleton h-6 w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                icon="📊"
                label="Portfolio Value"
                value={formatCurrency(stats.totalValue)}
            />
            <StatCard
                icon="💰"
                label="Total PnL"
                value={`${stats.totalPnl >= 0 ? '+' : ''}${formatCurrency(stats.totalPnl)}`}
                subValue={`${stats.totalPnlPercent >= 0 ? '+' : ''}${stats.totalPnlPercent.toFixed(1)}%`}
                colorClass={stats.totalPnl >= 0 ? 'text-growth' : 'text-caution'}
            />
            <StatCard
                icon="🎯"
                label="Positions"
                value={stats.positionsCount.toString()}
                subValue="Active markets"
            />
            <StatCard
                icon="📈"
                label="Win Rate"
                value={`${stats.winRate.toFixed(0)}%`}
                subValue={`${stats.tradesCount} trades`}
            />
        </div>
    );
}
