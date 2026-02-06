export function Footer() {
    return (
        <footer className="border-t border-border mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Branding */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">PolyRadar</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <a
                            href="https://x.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            X (Twitter)
                        </a>
                        <a
                            href="https://polymarket.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            Polymarket
                        </a>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-muted-foreground text-center md:text-right max-w-md">
                        Community-built analytics tool. Not affiliated with Polymarket. Not financial advice.
                    </p>
                </div>
            </div>
        </footer>
    );
}
