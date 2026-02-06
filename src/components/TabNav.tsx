'use client';

// Tab IDs
export const TAB_IDS = {
    TRADERS: 'traders',
    LP: 'lp',
} as const;

export type TabId = typeof TAB_IDS[keyof typeof TAB_IDS];

interface Tab {
    id: TabId;
    label: string;
}

const tabs: Tab[] = [
    { id: TAB_IDS.TRADERS, label: 'Trader Leaderboard' },
    { id: TAB_IDS.LP, label: 'LP Leaderboard' },
];

interface TabNavProps {
    activeTab: TabId;
    onTabChange: (tabId: TabId) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
    return (
        <div className="flex items-center justify-center">
            <div className="inline-flex items-center bg-muted p-1 rounded-lg">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id
                                ? 'bg-foreground text-background shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
