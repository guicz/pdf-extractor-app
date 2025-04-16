'use client';

import { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabInterfaceProps {
  tabs: Tab[];
  defaultTabId?: string;
}

export function TabInterface({ tabs, defaultTabId }: TabInterfaceProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  return (
    <div className="flex flex-col h-full">
      <div className="tabs tabs-boxed mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'tab-active' : ''} gap-2`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-auto border border-base-300 rounded-lg p-4 bg-base-100">
        {activeTab.content}
      </div>
    </div>
  );
} 