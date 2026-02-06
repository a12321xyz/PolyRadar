import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { Header, Footer } from '@/components';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PolyRadar - Polymarket Trader Analytics',
  description:
    'Free trader analytics for Polymarket. Look up any wallet, compare traders, and explore leaderboards.',
  keywords: ['Polymarket', 'trader analytics', 'wallet lookup', 'leaderboard', 'DeFi'],
  openGraph: {
    title: 'PolyRadar - Polymarket Trader Analytics',
    description: 'Look up any wallet. Compare traders. 100% free.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
