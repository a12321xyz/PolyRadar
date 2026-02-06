'use client';

import { Hero, Leaderboard } from '@/components';

export default function Home() {
  return (
    <div>
      {/* Hero section with search */}
      <Hero />

      {/* Leaderboard - immediately visible */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-semibold mb-4">Top Traders</h2>
        <Leaderboard />
      </section>
    </div>
  );
}
