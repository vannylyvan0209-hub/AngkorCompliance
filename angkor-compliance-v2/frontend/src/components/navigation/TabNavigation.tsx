import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Tab {
  id: string;
  label: string;
  path: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, className = '' }) => {
  const location = useLocation();

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              isActiveTab(tab.path)
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                  isActiveTab(tab.path)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
