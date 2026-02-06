import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-6">About PolyRadar</h1>

            <div className="prose prose-lg dark:prose-invert">
                <p className="text-lg text-muted-foreground mb-6">
                    PolyRadar is a free analytics tool for exploring Polymarket trader data.
                </p>

                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-3">📊 What We Offer</h2>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong>Trader Leaderboard</strong> - Top traders by volume and profit</li>
                            <li>• <strong>Wallet Analytics</strong> - Positions, activity, and stats for any wallet</li>
                            <li>• <strong>Compare Wallets</strong> - Side-by-side trader comparison</li>
                        </ul>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-3">🔓 100% Free & Open</h2>
                        <p className="text-muted-foreground">
                            All data comes from Polymarket&apos;s public APIs. No login required,
                            no premium tiers. Just analytics.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-3">📡 Data Sources</h2>
                        <p className="text-muted-foreground">
                            We use Polymarket&apos;s Data API for trader rankings, positions, and activity.
                            Data is refreshed in real-time when you load a page.
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        PolyRadar is not affiliated with Polymarket.
                        Built for the community.
                    </p>
                </div>

                <div className="mt-6">
                    <Link href="/" className="btn btn-primary">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
