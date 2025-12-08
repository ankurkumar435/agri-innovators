import React, { useState, useEffect } from 'react';
import { Cpu, Loader2, Leaf, TrendingUp, CloudRain, Bug } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
      // Get user location for weather-based recommendations
      const { data: locationData } = await supabase
        .from('user_locations')
        .select('latitude, longitude, city')
        .eq('user_id', user?.id)
        .single();

      // Get user's yield data for crop-based recommendations
      const { data: yieldsData } = await supabase
        .from('yields')
        .select('crop_type, season')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Generate AI-powered recommendations
      const recs = generateSmartRecommendations(locationData, yieldsData);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations(getDefaultRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const generateSmartRecommendations = (location: any, yields: any[]): Recommendation[] => {
    const month = new Date().getMonth();
    const recommendations: Recommendation[] = [];

    // Weather-based recommendation
    if (month >= 6 && month <= 9) {
      recommendations.push({
        category: 'Weather Alert',
        categoryHindi: 'मौसम चेतावनी',
        title: 'Monsoon Preparation',
        titleHindi: 'मानसून की तैयारी',
        description: 'Heavy rainfall expected. Ensure proper drainage in fields and protect young seedlings.',
        descriptionHindi: 'भारी बारिश की संभावना है। खेतों में उचित जल निकासी सुनिश्चित करें।',
        priority: 'high',
        icon: 'cloud'
      });
    } else if (month >= 11 || month <= 1) {
      recommendations.push({
        category: 'Weather Alert',
        categoryHindi: 'मौसम चेतावनी',
        title: 'Frost Warning',
        titleHindi: 'पाला चेतावनी',
        description: 'Low temperatures expected. Cover sensitive crops and irrigate in evening.',
        descriptionHindi: 'कम तापमान की संभावना। संवेदनशील फसलों को ढकें।',
        priority: 'high',
        icon: 'cloud'
      });
    }

    // Crop-based recommendations
    if (yields && yields.length > 0) {
      const cropTypes = [...new Set(yields.map(y => y.crop_type))];
      if (cropTypes.includes('Rice') || cropTypes.includes('Wheat')) {
        recommendations.push({
          category: 'Crop Management',
          categoryHindi: 'फसल प्रबंधन',
          title: 'Fertilizer Application',
          titleHindi: 'उर्वरक प्रयोग',
          description: 'Apply NPK fertilizer at current growth stage for optimal yield.',
          descriptionHindi: 'वर्तमान वृद्धि अवस्था में NPK उर्वरक लगाएं।',
          priority: 'medium',
          icon: 'leaf'
        });
      }
    }

    // Pest management recommendation
    recommendations.push({
      category: 'Pest Control',
      categoryHindi: 'कीट नियंत्रण',
      title: 'Regular Monitoring',
      titleHindi: 'नियमित निगरानी',
      description: 'Inspect crops weekly for pest infestations. Early detection prevents major losses.',
      descriptionHindi: 'कीट प्रकोप के लिए साप्ताहिक फसलों का निरीक्षण करें।',
      priority: 'medium',
      icon: 'bug'
    });

    // Market recommendation
    recommendations.push({
      category: 'Market Insight',
      categoryHindi: 'बाजार जानकारी',
      title: 'Price Trend Analysis',
      titleHindi: 'मूल्य प्रवृत्ति विश्लेषण',
      description: 'Check current market prices before selling. Store crops if prices are low.',
      descriptionHindi: 'बेचने से पहले बाजार भाव देखें। कम कीमत पर भंडारण करें।',
      priority: 'low',
      icon: 'trending'
    });

    return recommendations;
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
