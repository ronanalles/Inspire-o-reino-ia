
import React from 'react';
import { IconHome, IconBookOpen, IconSearch, IconBookmark, IconSparkles } from './IconComponents';
import { NavAction } from '../types';

interface BottomNavBarProps {
  onNavigate: (action: NavAction) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate }) => {
  const navItems = [
    { action: 'home' as NavAction, label: 'Início', icon: IconHome },
    { action: 'reading' as NavAction, label: 'Bíblia', icon: IconBookOpen },
    { action: 'thematic' as NavAction, label: 'Estudo', icon: IconSparkles },
    { action: 'search' as NavAction, label: 'Pesquisar', icon: IconSearch },
    { action: 'bookmarks' as NavAction, label: 'Salvos', icon: IconBookmark },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 w-full bg-card border-t border-border grid grid-cols-5 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)] z-20">
      {navItems.map((item) => {
        return (
          <button
            key={item.action}
            onClick={() => onNavigate(item.action)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors text-muted-foreground hover:text-primary`}
            aria-label={item.label}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
