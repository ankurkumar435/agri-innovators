import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, MapPin, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface PriceHistory {
  date: string;
  price: number;
}

interface CropPrice {
  name: string;
  nameHindi: string;
  category: string;
  price: number;
  change: number;
  trend: 'up' | 'down';
  unit: string;
  market: string;
  history: PriceHistory[];
}

interface MarketData {
  success: boolean;
  location: {
    state: string;
    city: string;
  };
  lastUpdated: string;
  currency: string;
  crops: CropPrice[];
}

export const MarketTrendsCard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMarketPrices = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      }

      let state = 'India';
      let city = 'Local Market';

      if (user) {
        const { data: locationData } = await supabase
          .from('user_locations')
          .select('city, region, country')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (locationData) {
          state = locationData.region || 'India';
          city = locationData.city || 'Local Market';
        }
      }

      const { data, error } = await supabase.functions.invoke('market-prices', {
        body: { state, city },
      });

      if (error) {
        console.error('Error fetching market prices:', error);
        throw error;
      }

      setMarketData(data);

      if (showRefreshToast) {
        toast({
          title: "Prices Updated",
          description: "Market prices have been refreshed",
        });
      }
    } catch (error) {
      console.error('Failed to fetch market prices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market prices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketPrices();
    
    const interval = setInterval(() => {
      fetchMarketPrices();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const toggleCropExpansion = (cropName: string) => {
    setExpandedCrop(expandedCrop === cropName ? null : cropName);
  };

  if (loading) {
    return (
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading market prices...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Market Trends</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchMarketPrices(true)}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Location */}
        {marketData?.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{marketData.location.city}, {marketData.location.state}</span>
          </div>
        )}

        {/* Crop Prices */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {marketData?.crops.map((crop) => (
            <div key={crop.name} className="border border-border/50 rounded-lg overflow-hidden">
              {/* Crop Row */}
              <div 
                className="flex items-center justify-between py-3 px-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleCropExpansion(crop.name)}
              >
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-foreground">{crop.name}</div>
                  <div className="text-xs text-muted-foreground">{crop.nameHindi}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">
                      {formatPrice(crop.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">per {crop.unit}</div>
                  </div>
                  
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    crop.trend === 'up' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {crop.trend === 'up' ? 
                      <TrendingUp className="w-3 h-3" /> : 
                      <TrendingDown className="w-3 h-3" />
                    }
                    <span>{crop.change}%</span>
                  </div>

                  {expandedCrop === crop.name ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Price History Chart */}
              {expandedCrop === crop.name && crop.history && (
                <div className="px-3 pb-3 pt-1 bg-accent/20">
                  <div className="text-xs text-muted-foreground mb-2">7-Day Price History</div>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={crop.history}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatChartDate}
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['dataMin - 100', 'dataMax + 100']}
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={false}
                          tickFormatter={(value) => `₹${value}`}
                          width={50}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatPrice(value), 'Price']}
                          labelFormatter={(label) => formatChartDate(label)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke={crop.trend === 'up' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                          strokeWidth={2}
                          dot={{ fill: crop.trend === 'up' ? 'hsl(var(--success))' : 'hsl(var(--destructive))', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Updated {marketData?.lastUpdated ? formatTime(marketData.lastUpdated) : 'recently'} • Tap crop for 7-day chart
          </p>
        </div>
      </div>
    </Card>
  );
};