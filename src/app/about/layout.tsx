import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | PolyRadar',
    description: 'About PolyRadar - Polymarket Trader Analytics',
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
