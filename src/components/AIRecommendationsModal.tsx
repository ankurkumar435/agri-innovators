import React, { useState, useEffect } from 'react';
import { Cpu, Loader2, Leaf, TrendingUp, CloudRain, Bug, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AIRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Recommendation {
  category: string;
  categoryHindi: string;
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  priority: 'high' | 'medium' | 'low';
  icon: 'leaf' | 'trending' | 'cloud' | 'bug';
}

export const AIRecommendationsModal: React.FC<AIRecommendationsModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      generateRecommendations();
    }
  }, [isOpen, user]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Get user location
      const { data: locationData } = await supabase
        .from('user_locations')
        .select('latitude, longitude, city, region, country')
        .eq('user_id', user?.id)
        .single();

      // Get user's yield data for crops
      const { data: yieldsData } = await supabase
        .from('yields')
        .select('crop_type, season')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const crops = yieldsData?.map(y => y.crop_type) || [];

      // Fetch current weather if location available
      let weatherData = null;
      if (locationData?.latitude && locationData?.longitude) {
        try {
          const { data: weather } = await supabase.functions.invoke('weather', {
            body: { latitude: locationData.latitude, longitude: locationData.longitude }
          });
          if (weather) {
            weatherData = {
              temperature: weather.temperature,
              condition: weather.description || weather.condition
            };
          }
        } catch (e) {
          console.log('Weather fetch optional, continuing without it');
        }
      }

      // Call AI recommendations edge function
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          location: locationData,
          crops: crops,
          weather: weatherData
        }
      });

      if (error) {
        console.error('AI recommendations error:', error);
        throw error;
      }

      if (data?.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations(getDefaultRecommendations());
      }

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Could not generate AI recommendations');
      setRecommendations(getDefaultRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultRecommendations = (): Recommendation[] => [
    {
      category: 'General',
      categoryHindi: 'सामान्य',
      title: 'Soil Testing',
      titleHindi: 'मिट्टी परीक्षण',
      description: 'Get your soil tested every season for optimal fertilizer usage.',
      descriptionHindi: 'हर मौसम में मिट्टी का परीक्षण करवाएं।',
      priority: 'medium',
      icon: 'leaf'
    },
    {
      category: 'Pest Control',
      categoryHindi: 'कीट नियंत्रण',
      title: 'Regular Monitoring',
      titleHindi: 'नियमित निगरानी',
      description: 'Inspect crops weekly for pest infestations to prevent losses.',
      descriptionHindi: 'कीट प्रकोप के लिए साप्ताहिक फसलों का निरीक्षण करें।',
      priority: 'medium',
      icon: 'bug'
    }
  ];

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'leaf': return <Leaf className="w-5 h-5" />;
      case 'trending': return <TrendingUp className="w-5 h-5" />;
      case 'cloud': return <CloudRain className="w-5 h-5" />;
      case 'bug': return <Bug className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority / उच्च';
      case 'medium': return 'Medium / मध्यम';
      case 'low': return 'Low / कम';
      default: return priority;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            AI Recommendations / AI सिफारिशें
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing your farm data...</p>
            <p className="text-xs text-muted-foreground">आपके खेत के डेटा का विश्लेषण...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className={`p-4 border ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-background">
                    {getIcon(rec.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium opacity-70">
                        {rec.category} / {rec.categoryHindi}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background">
                        {getPriorityLabel(rec.priority)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{rec.titleHindi}</p>
                    <p className="text-sm mt-2">{rec.description}</p>
                    <p className="text-sm text-muted-foreground">{rec.descriptionHindi}</p>
                  </div>
                </div>
              </Card>
            ))}

            <Button onClick={generateRecommendations} variant="outline" className="w-full">
              <Cpu className="w-4 h-4 mr-2" />
              Refresh / रिफ्रेश करें
            </Button>

            <Button onClick={onClose} variant="ghost" className="w-full">
              Close / बंद करें
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
