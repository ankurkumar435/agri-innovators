import React, { lazy, Suspense } from 'react';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Lazy load heavy tab components
const ChatBot = lazy(() => import('@/components/ChatBot').then(m => ({ default: m.ChatBot })));
const CropScanner = lazy(() => import('@/components/CropScanner').then(m => ({ default: m.CropScanner })));
const MarketHub = lazy(() => import('@/components/MarketHub').then(m => ({ default: m.MarketHub })));

// Loading skeleton
const TabSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-muted rounded w-40"></div>
    <div className="h-48 bg-muted rounded"></div>
    <div className="h-32 bg-muted rounded"></div>
  </div>
);

interface ContentSectionProps {
  activeTab: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({ activeTab }) => {
  const getContent = () => {
    switch (activeTab) {
      case 'market':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <MarketHub />
          </Suspense>
        );

      case 'scan':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <CropScanner />
          </Suspense>
        );

      case 'ai-bot':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <ChatBot />
          </Suspense>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Profile</h2>
            </div>
            
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-foreground">Farm Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farm Size</span>
                  <span className="font-medium">15 acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Crops</span>
                  <span className="font-medium">Rice, Wheat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farming Experience</span>
                  <span className="font-medium">12 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Soil Type</span>
                  <span className="font-medium">Clay Loam</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-foreground">Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weather Alerts</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Market Updates</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pest Warnings</span>
                  <div className="w-10 h-6 bg-muted rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (activeTab === 'home') return null;

  return (
    <div className="pb-20">
      {getContent()}
    </div>
  );
};