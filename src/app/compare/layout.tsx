import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Compare Wallets | PolyRadar',
    description: 'Compare two Polymarket wallets side-by-side',
};

export default function CompareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
