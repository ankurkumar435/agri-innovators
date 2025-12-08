import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Loader2, Sprout, Droplets, Sun, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CropAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Advisory {
  title: string;
  titleHindi: string;
  tips: string[];
  tipsHindi: string[];
  icon: 'sprout' | 'droplets' | 'sun' | 'calendar';
}

export const CropAdvisoryModal: React.FC<CropAdvisoryModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [location, setLocation] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      fetchAdvisories();
    }
  }, [isOpen, user]);

  const fetchAdvisories = async () => {
    setLoading(true);
    try {
      // Get user location
      const { data: locationData } = await supabase
        .from('user_locations')
        .select('city, region, country')
        .eq('user_id', user?.id)
        .single();

      if (locationData) {
        setLocation(`${locationData.city || ''}, ${locationData.region || ''}`);
      }

      // Get current month for seasonal advice
      const month = new Date().getMonth();
      const season = getSeason(month);

      // Generate advisories based on season
      setAdvisories(getSeasonalAdvisories(season));
    } catch (error) {
      console.error('Error fetching advisories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeason = (month: number): string => {
    if (month >= 2 && month <= 5) return 'summer';
    if (month >= 6 && month <= 9) return 'monsoon';
    return 'winter';
  };

  const getSeasonalAdvisories = (season: string): Advisory[] => {
    const advisories: Record<string, Advisory[]> = {
      summer: [
        {
          title: 'Irrigation Management',
          titleHindi: 'सिंचाई प्रबंधन',
          tips: [
            'Water crops early morning or late evening',
            'Use drip irrigation to conserve water',
            'Mulch around plants to retain moisture'
          ],
          tipsHindi: [
            'सुबह जल्दी या शाम को सिंचाई करें',
            'पानी बचाने के लिए ड्रिप सिंचाई का उपयोग करें',
            'नमी बनाए रखने के लिए पौधों के आसपास मल्चिंग करें'
          ],
          icon: 'droplets'
        },
        {
          title: 'Heat Protection',
          titleHindi: 'गर्मी से सुरक्षा',
          tips: [
            'Use shade nets for sensitive crops',
            'Apply white wash on fruit trees',
            'Increase watering frequency'
          ],
          tipsHindi: [
            'संवेदनशील फसलों के लिए शेड नेट का उपयोग करें',
            'फलदार पेड़ों पर सफेदी करें',
            'सिंचाई की आवृत्ति बढ़ाएं'
          ],
          icon: 'sun'
        }
      ],
      monsoon: [
        {
          title: 'Drainage Management',
          titleHindi: 'जल निकासी प्रबंधन',
          tips: [
            'Ensure proper field drainage',
            'Create raised beds for vegetables',
            'Monitor for waterlogging'
          ],
          tipsHindi: [
            'खेत में उचित जल निकासी सुनिश्चित करें',
            'सब्जियों के लिए उठी हुई क्यारियां बनाएं',
            'जलभराव की निगरानी करें'
          ],
          icon: 'droplets'
        },
        {
          title: 'Disease Prevention',
          titleHindi: 'रोग निवारण',
          tips: [
            'Apply fungicides preventively',
            'Remove infected plant parts',
            'Maintain proper spacing between plants'
          ],
          tipsHindi: [
            'रोकथाम के लिए कवकनाशी का छिड़काव करें',
            'संक्रमित पौधों के हिस्से हटाएं',
            'पौधों के बीच उचित दूरी बनाए रखें'
          ],
          icon: 'sprout'
        }
      ],
      winter: [
        {
          title: 'Frost Protection',
          titleHindi: 'पाले से सुरक्षा',
          tips: [
            'Cover sensitive crops with straw',
            'Irrigate fields in evening for warmth',
            'Use smoke screens during cold nights'
          ],
          tipsHindi: [
            'संवेदनशील फसलों को पुआल से ढकें',
            'गर्मी के लिए शाम को खेतों में सिंचाई करें',
            'ठंडी रातों में धुआं स्क्रीन का उपयोग करें'
          ],
          icon: 'sun'
        },
        {
          title: 'Rabi Crop Care',
          titleHindi: 'रबी फसल देखभाल',
          tips: [
            'Apply nitrogen fertilizer at right stage',
            'Monitor for aphids and other pests',
            'Maintain optimal soil moisture'
          ],
          tipsHindi: [
            'सही अवस्था में नाइट्रोजन उर्वरक डालें',
            'माहू और अन्य कीटों की निगरानी करें',
            'मिट्टी में इष्टतम नमी बनाए रखें'
          ],
          icon: 'calendar'
        }
      ]
    };

    return advisories[season] || advisories.summer;
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'sprout': return <Sprout className="w-5 h-5" />;
      case 'droplets': return <Droplets className="w-5 h-5" />;
      case 'sun': return <Sun className="w-5 h-5" />;
      case 'calendar': return <Calendar className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Crop Advisory / फसल सलाह
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {location && (
              <p className="text-sm text-muted-foreground text-center">
                Location: {location}
              </p>
            )}

            {advisories.map((advisory, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {getIcon(advisory.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{advisory.title}</h3>
                    <p className="text-sm text-muted-foreground">{advisory.titleHindi}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {advisory.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="text-sm">
                      <p className="text-foreground">• {tip}</p>
                      <p className="text-muted-foreground ml-3">{advisory.tipsHindi[tipIndex]}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            <Button onClick={onClose} variant="outline" className="w-full">
              Close / बंद करें
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
