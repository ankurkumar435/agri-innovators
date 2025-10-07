import React from 'react';
import { Lightbulb, Bug, Mountain, Cpu, Store, BarChart3, User, Scan, Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ChatBot } from '@/components/ChatBot';
import { CropScanner } from '@/components/CropScanner';

interface ContentSectionProps {
  activeTab: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({ activeTab }) => {
  const getContent = () => {
    switch (activeTab) {
      case 'market':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Market Hub</h2>
            </div>
            
            <Card className="p-4 bg-gradient-earth border-0 text-white">
              <h3 className="font-semibold mb-2">Today's Best Prices</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Premium Rice</span>
                  <span className="font-semibold">₹2,650/qt</span>
                </div>
                <div className="flex justify-between">
                  <span>Organic Wheat</span>
                  <span className="font-semibold">₹2,200/qt</span>
                </div>
                <div className="flex justify-between">
                  <span>Fresh Corn</span>
                  <span className="font-semibold">₹1,950/qt</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-foreground">Market Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <p className="text-sm text-muted-foreground">Rice prices up 5% this week due to high demand</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <p className="text-sm text-muted-foreground">Wheat market showing seasonal fluctuations</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <p className="text-sm text-muted-foreground">New export opportunities for corn</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'scan':
        return <CropScanner />;

      case 'ai-bot':
        return <ChatBot />;

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