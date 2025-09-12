import React from 'react';
import { IconHome, IconBookOpen, IconSparkles } from './IconComponents';

type View = 'home' | 'reading' | 'tools';

interface BottomNavBarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { view: 'home' as View, label: 'Início', icon: IconHome },
    { view: 'reading' as View, label: 'Leitura', icon: IconBookOpen },
    { view: 'tools' as View, label: 'Ferramentas', icon: IconSparkles },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 w-full bg-card border-t border-border flex justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = activeView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};