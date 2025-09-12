import React from 'react';
import { Lightbulb, Bug, Mountain, Cpu, Store, BarChart3, User, Scan, Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Scan className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Crop Scanner</h2>
            </div>
            
            <Card className="p-6 text-center bg-gradient-nature border-0 text-white">
              <Scan className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <h3 className="font-semibold text-lg mb-2">Scan Your Crop</h3>
              <p className="text-sm opacity-90 mb-4">Point your camera at crops to get instant AI-powered analysis</p>
              <button className="bg-white text-nature-primary px-6 py-2 rounded-full font-semibold">
                Start Scanning
              </button>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-foreground">Recent Scans</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Tomato Plant</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Rice Field</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">Monitor</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'ai-bot':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">AI Assistant</h2>
            </div>
            
            <Card className="p-4 bg-gradient-sky border-0 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="w-8 h-8" />
                <div>
                  <h3 className="font-semibold">FarmBot AI</h3>
                  <p className="text-sm opacity-90">Your farming companion</p>
                </div>
              </div>
              <p className="text-sm opacity-90">Ask me anything about farming, crops, weather, or market trends!</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-foreground">Quick Questions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-muted rounded-lg text-sm hover:bg-muted/80">
                  "What's the best time to plant rice?"
                </button>
                <button className="w-full text-left p-3 bg-muted rounded-lg text-sm hover:bg-muted/80">
                  "How to prevent pest attacks?"
                </button>
                <button className="w-full text-left p-3 bg-muted rounded-lg text-sm hover:bg-muted/80">
                  "Current market price for wheat?"
                </button>
              </div>
            </Card>
          </div>
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