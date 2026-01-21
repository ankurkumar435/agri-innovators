import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, MapPin, RefreshCw, Loader2, ChevronDown, ChevronUp, Search, Filter, Store } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

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

const categoryLabels: Record<string, string> = {
  cereals: 'Cereals',
  pulses: 'Pulses',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  oilseeds: 'Oilseeds',
  spices: 'Spices',
  fibres: 'Fibres',
  cash_crops: 'Cash Crops',
};

const categoryColors: Record<string, string> = {
  cereals: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  pulses: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  vegetables: 'bg-green-500/10 text-green-600 border-green-500/20',
  fruits: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  oilseeds: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  spices: 'bg-red-500/10 text-red-600 border-red-500/20',
  fibres: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  cash_crops: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export const MarketHub: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

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

  const filteredCrops = useMemo(() => {
    if (!marketData?.crops) return [];
    
    return marketData.crops.filter(crop => {
      const matchesSearch = searchQuery === '' || 
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.nameHindi.includes(searchQuery);
      
      const matchesCategory = selectedCategory === null || crop.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [marketData?.crops, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    if (!marketData?.crops) return [];
    return [...new Set(marketData.crops.map(crop => crop.category))];
  }, [marketData?.crops]);

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
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">{t('marketHub')}</h2>
        </div>
        <Card className="p-8 bg-card border border-border">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading market prices...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">{t('marketHub')}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchMarketPrices(true)}
          disabled={refreshing}
          className="h-9 w-9"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Location Info */}
      {marketData?.location && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{marketData.location.city}, {marketData.location.state}</span>
          <span className="mx-2">•</span>
          <span>Updated {formatTime(marketData.lastUpdated)}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search crops... (e.g., Rice, आलू, Tomato)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => setSelectedCategory(null)}
        >
          All ({marketData?.crops.length || 0})
        </Badge>
        {categories.map(category => (
          <Badge
            key={category}
            variant="outline"
            className={`cursor-pointer whitespace-nowrap border ${
              selectedCategory === category 
                ? categoryColors[category] 
                : 'hover:bg-accent'
            }`}
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
          >
            {categoryLabels[category] || category} ({marketData?.crops.filter(c => c.category === category).length})
          </Badge>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCrops.length} of {marketData?.crops.length || 0} crops
      </div>

      {/* Crops List */}
      <div className="space-y-2">
        {filteredCrops.length === 0 ? (
          <Card className="p-8 bg-card border border-border text-center">
            <p className="text-muted-foreground">No crops found matching your search</p>
          </Card>
        ) : (
          filteredCrops.map((crop) => (
            <Card key={crop.name} className="overflow-hidden border border-border">
              {/* Crop Row */}
              <div 
                className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleCropExpansion(crop.name)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{crop.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs border ${categoryColors[crop.category]}`}
                    >
                      {categoryLabels[crop.category]}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{crop.nameHindi}</div>
                </div>
                
                <div className="flex items-center gap-3">
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
              {expandedCrop === crop.name && crop.history && crop.history.length > 0 && (
                <div className="px-4 pb-4 pt-2 bg-accent/20 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-muted-foreground">7-Day Price History</div>
                    <div className="text-xs text-muted-foreground">{crop.market}</div>
                  </div>
                  <div className="h-40 w-full">
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
                          width={55}
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
                  
                  {/* Price Summary */}
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">7-Day Low</div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatPrice(Math.min(...crop.history.map(h => h.price)))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Current</div>
                      <div className="text-sm font-semibold text-primary">
                        {formatPrice(crop.price)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">7-Day High</div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatPrice(Math.max(...crop.history.map(h => h.price)))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Tap any crop to view 7-day price history • Prices in INR
        </p>
      </div>
    </div>
  );
};