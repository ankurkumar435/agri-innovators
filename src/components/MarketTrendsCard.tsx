import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const MarketTrendsCard: React.FC = () => {
  const crops = [
    { name: 'Rice', price: 2450, change: 5.2, trend: 'up' },
    { name: 'Wheat', price: 2100, change: -2.1, trend: 'down' },
    { name: 'Corn', price: 1850, change: 3.8, trend: 'up' },
    { name: 'Soybeans', price: 4200, change: 1.5, trend: 'up' },
  ];

  return (
    <Card className="p-4 bg-card border border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Market Trends</h3>
          </div>
          <DollarSign className="w-5 h-5 text-success" />
        </div>

        <div className="space-y-3">
          {crops.map((crop) => (
            <div key={crop.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-foreground">{crop.name}</div>
                <div className="text-sm text-muted-foreground">₹{crop.price}/qt</div>
              </div>
              
              <div className={`flex items-center gap-1 text-sm ${
                crop.trend === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                {crop.trend === 'up' ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                <span>{Math.abs(crop.change)}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Updated 2 hours ago • View detailed analysis
          </p>
        </div>
      </div>
    </Card>
  );
};