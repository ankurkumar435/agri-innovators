import React from 'react';
import { Home, Store, Scan, Bot, User, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavigationItem {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  gradient: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: Home, labelKey: 'home', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'market', icon: Store, labelKey: 'market', gradient: 'from-amber-500 to-orange-500' },
  { id: 'scan', icon: Scan, labelKey: 'scan', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'ai-bot', icon: Bot, labelKey: 'aiBot', gradient: 'from-violet-500 to-purple-500' },
  { id: 'profile', icon: User, labelKey: 'profile', gradient: 'from-rose-500 to-pink-500' },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="nav-floating max-w-md mx-auto">
        <div className="flex items-center justify-around py-3 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-1 transition-all duration-300"
              >
                {/* 3D Icon Container */}
                <div
                  className={`
                    relative p-3 rounded-2xl transition-all duration-300 transform
                    ${isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg scale-110 -translate-y-1` 
                      : 'bg-secondary hover:bg-secondary/80 hover:scale-105'
                    }
                  `}
                  style={{
                    boxShadow: isActive 
                      ? `0 4px 0 rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.2)`
                      : `0 2px 4px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.1)`,
                    transform: isActive ? 'translateY(-4px) scale(1.1)' : undefined,
                  }}
                >
                  {/* Shine effect */}
                  <div 
                    className={`absolute inset-0 rounded-2xl overflow-hidden ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    }}
                  />
                  
                  {/* Icon */}
                  <Icon 
                    className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-muted-foreground'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Glow effect for active state */}
                  {isActive && (
                    <div 
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} blur-xl opacity-50 -z-10`}
                      style={{ transform: 'scale(1.5)' }}
                    />
                  )}
                </div>
                
                {/* Label */}
                <span 
                  className={`text-[10px] font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {t(item.labelKey)}
                </span>
                
                {/* Active indicator dot */}
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isActive 
                      ? `w-4 bg-gradient-to-r ${item.gradient}` 
                      : 'w-0 bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
