import React, { useState } from 'react';
import { Home, Store, Scan, Bot, User } from 'lucide-react';

interface NavigationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hasLogo?: boolean;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'market', icon: Store, label: 'Market', hasLogo: true },
  { id: 'scan', icon: Scan, label: 'Scan' },
  { id: 'ai-bot', icon: Bot, label: 'AI Bot' },
  { id: 'profile', icon: User, label: 'Profile' },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
                {item.hasLogo && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-nature-secondary rounded-full border-2 border-card"></div>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};