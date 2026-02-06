'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Hero() {
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = address.trim();

        if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
            setError('Enter a valid 0x address');
            return;
        }

        setError('');
        router.push(`/wallet/${trimmed}`);
    };

    return (
        <section className="bg-gradient-to-br from-primary via-secondary to-primary/80 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-3">
                    {/* Heading */}
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Polymarket Trader Analytics
                    </h1>
                    <p className="text-sm text-white/80">
                        Lookup any wallet. No sign-up needed.
                    </p>

                    {/* Search bar */}
                    <form onSubmit={handleSubmit} className="max-w-xl mx-auto pt-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => { setAddress(e.target.value); setError(''); }}
                                placeholder="Enter wallet address (0x...)"
                                className="flex-1 px-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg bg-white text-primary font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Lookup
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-white mt-2 bg-red-500/80 rounded px-2 py-1 inline-block">
                                {error}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
